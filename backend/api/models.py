from django.db import models


class Study(models.Model):
    """One uploaded scan/series a clinician is screening."""
    patient_ref = models.CharField(max_length=64, blank=True)
    image = models.FileField(upload_to='studies/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    risk_tier = models.CharField(max_length=32, blank=True)
    risk_reason = models.CharField(max_length=255, blank=True)
    model_version = models.CharField(max_length=64, blank=True)
    # Set by the MRIGatekeeper check (api.inference.gate_check) each time
    # /predict/ runs. is_valid_mri is null until a prediction has been
    # attempted at least once.
    is_valid_mri = models.BooleanField(null=True, blank=True)
    rejection_reason = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f'Study {self.id} ({self.patient_ref or "unlabelled"})'


class LevelPoint(models.Model):
    """A single clicked point on the image, marked by the user in the React
    viewer (see the notebook's Phase 11C note — there is no automatic
    localization model yet, so a point must be supplied). Matches the
    notebook's train_label_coordinates.csv scheme: coordinates are per
    condition+level, not shared across conditions at the same level, so a
    full study needs up to 25 points (5 levels x 5 conditions)."""
    study = models.ForeignKey(Study, related_name='points', on_delete=models.CASCADE)
    level = models.CharField(max_length=16)      # e.g. "L4/L5"
    condition = models.CharField(max_length=64)  # e.g. "Spinal Canal Stenosis"
    x = models.FloatField()
    y = models.FloatField()


class Prediction(models.Model):
    """One condition/level result returned by the model for a study."""
    study = models.ForeignKey(Study, related_name='predictions', on_delete=models.CASCADE)
    level = models.CharField(max_length=16)
    condition = models.CharField(max_length=64)
    severity = models.CharField(max_length=16, blank=True, null=True)
    confidence = models.FloatField(blank=True, null=True)
    error = models.CharField(max_length=64, blank=True, null=True)
