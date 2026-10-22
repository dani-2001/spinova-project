"""
Bridges the notebook's exported model into Django.

Expects these files at settings.MODEL_DIR (copy them there from the
notebook's EDGE_DIR after running Phase 11H/11I/11H2/11J):
  - student_model.onnx        severity classifier (Phase 11H)
  - model_config.json         IMG_SIZE, CROP_FRAC, CLASS_NAMES, CONDITIONS,
                               normalization stats (Phase 11J)
  - gatekeeper_backbone.onnx  MobileNetV3-Small embedding backbone (Phase 11H2)
  - gate_config.json          ref_mean/ref_std/threshold for the novelty
                               check (Phase 11H2, MRIGatekeeper.save)

The gatekeeper is optional at runtime: if its two files aren't present,
every study is treated as valid and a warning is logged, so a partial
deployment (severity model only) still works end to end.

This module intentionally duplicates none of the notebook's training code —
only the minimal preprocessing needed to go from a raw image + a clicked
(x, y) point to a model-ready crop, matching eval_tf and MRIGatekeeper
exactly.
"""
import json
import logging
import numpy as np
from PIL import Image
from django.conf import settings

logger = logging.getLogger(__name__)

_session = None
_config = None
_gate_session = None
_gate_config = None
_gate_checked = False


def _load():
    global _session, _config
    if _session is not None:
        return
    import onnxruntime as ort

    config_path = settings.MODEL_DIR / 'model_config.json'
    model_path = settings.MODEL_DIR / 'student_model.onnx'
    if not config_path.exists() or not model_path.exists():
        raise FileNotFoundError(
            'Model artifacts missing. Copy student_model.onnx and '
            'model_config.json from the notebook EDGE_DIR into '
            f'{settings.MODEL_DIR}'
        )
    _config = json.loads(config_path.read_text())
    _session = ort.InferenceSession(str(model_path))


def _load_gate():
    """Best-effort load of the MRIGatekeeper ONNX export. Sets both globals
    to None (rather than raising) if the artifacts are missing, so a study
    can still be screened without the gate — see module docstring."""
    global _gate_session, _gate_config, _gate_checked
    if _gate_checked:
        return
    _gate_checked = True

    gate_config_path = settings.MODEL_DIR / 'gate_config.json'
    gate_model_path = settings.MODEL_DIR / 'gatekeeper_backbone.onnx'
    if not gate_config_path.exists() or not gate_model_path.exists():
        logger.warning(
            'Gatekeeper artifacts missing (gatekeeper_backbone.onnx / '
            'gate_config.json) — skipping the lumbar-MRI validity check for '
            'this deployment. Copy them from the notebook EDGE_DIR '
            '(Phase 11H2) to enable it.'
        )
        return

    import onnxruntime as ort
    _gate_config = json.loads(gate_config_path.read_text())
    _gate_session = ort.InferenceSession(str(gate_model_path))


def gate_check(pil_img):
    """Mirror MRIGatekeeper.predict(): resize the whole (uncropped) image,
    embed it with the exported backbone, and score its distance from the
    fitted in-distribution cloud of lumbar spine MRI slices.

    Returns (is_valid: bool, distance: float | None, reason: str | None).
    If the gatekeeper artifacts aren't deployed, returns (True, None, None)
    so the severity models still run.
    """
    _load_gate()
    if _gate_session is None:
        return True, None, None

    size = _gate_config['img_size']
    mean = np.array(_gate_config['imagenet_mean'], dtype=np.float32)
    std = np.array(_gate_config['imagenet_std'], dtype=np.float32)
    ref_mean = np.array(_gate_config['ref_mean'], dtype=np.float32)
    ref_std = np.array(_gate_config['ref_std'], dtype=np.float32)
    threshold = _gate_config['threshold']

    img = pil_img.convert('RGB').resize((size, size), Image.BILINEAR)
    arr = np.asarray(img, dtype=np.float32) / 255.0
    arr = (arr - mean) / std
    arr = arr.transpose(2, 0, 1)[None, ...].astype(np.float32)

    input_name = _gate_session.get_inputs()[0].name
    embedding = _gate_session.run(None, {input_name: arr})[0][0]

    z = (embedding - ref_mean) / ref_std
    distance = float(np.sqrt((z ** 2).sum()))

    if distance > threshold:
        reason = (
            f'Image does not resemble a lumbar spine MRI '
            f'(novelty distance {distance:.1f} > threshold {threshold:.1f}).'
        )
        return False, distance, reason
    return True, distance, None


LEVELS = ['L1/L2', 'L2/L3', 'L3/L4', 'L4/L5', 'L5/S1']


def detect_levels(pil_img):
    """Return coarse lumbar level boxes as normalized relative rectangles."""
    box_width = 0.82
    box_height = 0.13
    x = 0.09
    spacing = 0.075
    start_y = 0.10

    return [
        {
            'level': level,
            'x': x,
            'y': min(start_y + i * (box_height + spacing), 1.0 - box_height),
            'width': box_width,
            'height': box_height,
        }
        for i, level in enumerate(LEVELS)
    ]


def _crop_and_normalize(pil_img, x, y):
    """Mirror the notebook's load_crop_safe() + eval_tf exactly."""
    crop_frac = _config['CROP_FRAC']
    out_size = _config['IMG_SIZE']
    mean = np.array(_config['IMAGENET_MEAN'], dtype=np.float32)
    std = np.array(_config['IMAGENET_STD'], dtype=np.float32)

    w, h = pil_img.size
    half = max(int(round(crop_frac * min(h, w) / 2)), 16)
    cx, cy = int(round(x)), int(round(y))
    box = (max(0, cx - half), max(0, cy - half), min(w, cx + half), min(h, cy + half))
    crop = pil_img.crop(box).resize((out_size, out_size), Image.BILINEAR).convert('RGB')

    arr = np.asarray(crop, dtype=np.float32) / 255.0
    arr = (arr - mean) / std
    arr = arr.transpose(2, 0, 1)[None, ...]  # NCHW
    return arr.astype(np.float32)


def predict_points(pil_img, points):
    """
    points: list of {"level": "L4/L5", "condition": "Spinal Canal Stenosis",
    "x": .., "y": ..} — one entry per condition+level the user marked in the
    React viewer (up to 25 for a full study: 5 levels x 5 conditions), each
    with its own coordinate, matching the notebook's crop scheme exactly —
    one point = one crop = one severity prediction.
    """
    _load()
    class_names = _config['CLASS_NAMES']
    input_name = _session.get_inputs()[0].name

    results = []
    for point in points:
        try:
            batch = _crop_and_normalize(pil_img, point['x'], point['y'])
            logits = _session.run(None, {input_name: batch})[0][0]
            probs = np.exp(logits - logits.max())
            probs = probs / probs.sum()
            pred = int(probs.argmax())
            results.append({
                'level': point['level'],
                'condition': point['condition'],
                'severity': class_names[pred],
                'confidence': float(probs[pred]),
                'error': None,
            })
        except Exception as exc:  # noqa: BLE001 — surface to the API response
            results.append({
                'level': point['level'], 'condition': point['condition'],
                'severity': None, 'confidence': None, 'error': str(exc),
            })
    return results


def compute_risk_tier(results):
    """Same draft rule as the notebook's compute_risk_tier — keep both in
    sync manually until this logic is factored into one shared place."""
    rank = {'Normal/Mild': 0, 'Moderate': 1, 'Severe': 2}
    severities = [r['severity'] for r in results if r['severity']]
    n_severe = sum(1 for s in severities if rank[s] == 2)
    n_moderate = sum(1 for s in severities if rank[s] == 1)

    if n_severe >= 2:
        return {'tier': 'High', 'reason': f'{n_severe} severe findings across levels'}
    if n_severe == 1:
        return {'tier': 'Moderate-High', 'reason': '1 severe finding'}
    if n_moderate >= 3:
        return {'tier': 'Moderate', 'reason': f'{n_moderate} moderate findings'}
    if n_moderate >= 1:
        return {'tier': 'Low-Moderate', 'reason': f'{n_moderate} moderate finding(s)'}
    return {'tier': 'Low', 'reason': 'No moderate or severe findings'}
