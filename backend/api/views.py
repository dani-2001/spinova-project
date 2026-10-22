from PIL import Image
import numpy as np
import pydicom
from django.http import FileResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Study, LevelPoint, Prediction
from .serializers import StudySerializer
from . import inference
from . import report as report_module


def _load_image(path: str) -> Image.Image:
    """Load an image from disk. Try Pillow first, then fall back to DICOM via pydicom.

    Returns a PIL.Image in RGB mode.
    """
    try:
        img = Image.open(path)
        return img.convert('RGB')
    except Exception:
        # try DICOM
        ds = pydicom.dcmread(path)
        arr = ds.pixel_array.astype(np.float32)

        # apply rescale if present
        slope = float(getattr(ds, 'RescaleSlope', 1.0))
        intercept = float(getattr(ds, 'RescaleIntercept', 0.0))
        arr = arr * slope + intercept

        # apply windowing if available
        wc = getattr(ds, 'WindowCenter', None)
        ww = getattr(ds, 'WindowWidth', None)
        if wc is not None and ww is not None:
            try:
                # handle MultiValue
                if isinstance(wc, (list, tuple)):
                    wc = float(wc[0])
                if isinstance(ww, (list, tuple)):
                    ww = float(ww[0])
                low = wc - (ww / 2.0)
                high = wc + (ww / 2.0)
                arr = np.clip(arr, low, high)
            except Exception:
                pass

        # normalize to 0-255
        arr = arr - arr.min()
        if arr.max() > 0:
            arr = arr / arr.max()
        arr = (arr * 255.0).astype(np.uint8)

        if arr.ndim == 2:
            pil = Image.fromarray(arr).convert('RGB')
        elif arr.shape[2] == 3:
            pil = Image.fromarray(arr)
        else:
            pil = Image.fromarray(arr[..., 0]).convert('RGB')

        return pil


@api_view(['POST'])
def upload_study(request):
    """POST /api/studies/  multipart: image=<file>, patient_ref=<str> (optional)"""
    image = request.FILES.get('image')
    if not image:
        return Response({'detail': 'image file is required'}, status=status.HTTP_400_BAD_REQUEST)
    study = Study.objects.create(image=image, patient_ref=request.data.get('patient_ref', ''))
    return Response(StudySerializer(study).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_study(request, study_id):
    study = _get_study_or_404(study_id)
    if isinstance(study, Response):
        return study
    return Response(StudySerializer(study).data)


@api_view(['GET'])
def detect_levels(request, study_id):
    """GET /api/studies/<id>/detect-levels/  returns coarse lumbar boxes."""
    study = _get_study_or_404(study_id)
    if isinstance(study, Response):
        return study

    try:
        pil_img = _load_image(study.image.path)
    except FileNotFoundError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as exc:
        return Response({'detail': f'could not read image: {exc}'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        is_valid, _distance, reason = inference.gate_check(pil_img)
    except FileNotFoundError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    if not is_valid:
        return Response({'detail': reason or 'Image is not a valid lumbar spine MRI'}, status=status.HTTP_400_BAD_REQUEST)

    levels = inference.detect_levels(pil_img)
    return Response({'levels': levels})


@api_view(['POST'])
def predict_study(request, study_id):
    """
    POST /api/studies/<id>/predict/
    body: {"detected_levels": [{"level": "L4/L5", "x": 0.07, "y": 0.16, "width": 0.85, "height": 0.14}, ...]}

    Runs the exported ONNX model on all detected lumbar levels and stores
    the result. Each detected level is expanded into one crop per
    condition so the existing severity model can be reused.
    """
    study = _get_study_or_404(study_id)
    if isinstance(study, Response):
        return study

    detected_levels = request.data.get('detected_levels', [])
    if not detected_levels:
        return Response(
            {'detail': 'detected_levels is required and must contain at least one level box.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        pil_img = _load_image(study.image.path)
    except FileNotFoundError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as exc:
        return Response({'detail': f'could not read image: {exc}'}, status=status.HTTP_400_BAD_REQUEST)

    # Gate first: reject anything that doesn't look like a lumbar spine MRI
    # before spending a model call — and before overwriting any previous
    # (valid) points/predictions for this study.
    try:
        is_valid, _distance, reason = inference.gate_check(pil_img)
    except FileNotFoundError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    if not is_valid:
        study.is_valid_mri = False
        study.rejection_reason = reason
        study.risk_tier = ''
        study.risk_reason = ''
        study.points.all().delete()
        study.predictions.all().delete()
        study.save()
        return Response(StudySerializer(study).data)

    image_width, image_height = pil_img.size
    conditions = [
        'Spinal Canal Stenosis',
        'Left Neural Foraminal Narrowing',
        'Right Neural Foraminal Narrowing',
        'Left Subarticular Stenosis',
        'Right Subarticular Stenosis',
    ]
    points = []
    for level_box in detected_levels:
        center_x = (level_box['x'] + level_box['width'] / 2) * image_width
        center_y = (level_box['y'] + level_box['height'] / 2) * image_height
        for condition in conditions:
            points.append({
                'level': level_box['level'],
                'condition': condition,
                'x': center_x,
                'y': center_y,
            })

    study.points.all().delete()
    LevelPoint.objects.bulk_create([
        LevelPoint(study=study, level=p['level'], condition=p['condition'], x=p['x'], y=p['y'])
        for p in points
    ])

    try:
        results = inference.predict_points(pil_img, points)
    except FileNotFoundError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    study.predictions.all().delete()
    Prediction.objects.bulk_create([
        Prediction(study=study, level=r['level'], condition=r['condition'],
                   severity=r['severity'], confidence=r['confidence'], error=r['error'])
        for r in results
    ])

    risk = inference.compute_risk_tier(results)
    study.is_valid_mri = True
    study.rejection_reason = ''
    study.risk_tier = risk['tier']
    study.risk_reason = risk['reason']
    study.model_version = inference._config.get('MODEL_VERSION', 'unknown') if inference._config else 'unknown'
    study.save()

    return Response(StudySerializer(study).data)


@api_view(['GET'])
def download_report(request, study_id):
    """GET /api/studies/<id>/report/  streams a PDF screening report."""
    study = _get_study_or_404(study_id)
    if isinstance(study, Response):
        return study

    buffer = report_module.build_study_pdf(study)
    filename = f'spinova-report-study-{study.id}.pdf'
    return FileResponse(buffer, as_attachment=True, filename=filename, content_type='application/pdf')


def _get_study_or_404(study_id):
    try:
        return Study.objects.get(id=study_id)
    except Study.DoesNotExist:
        return Response({'detail': 'study not found'}, status=status.HTTP_404_NOT_FOUND)
