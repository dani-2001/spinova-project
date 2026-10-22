from rest_framework import serializers
from .models import Study, LevelPoint, Prediction
from . import explanations


class LevelPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelPoint
        fields = ['level', 'condition', 'x', 'y']


class PredictionSerializer(serializers.ModelSerializer):
    # Computed, not stored — see api/explanations.py. Keeping this out of
    # the DB means the wording can be revised without a migration or a
    # backfill of old predictions.
    explanation = serializers.SerializerMethodField()
    short_summary = serializers.SerializerMethodField()

    class Meta:
        model = Prediction
        fields = ['level', 'condition', 'severity', 'confidence', 'error', 'explanation', 'short_summary']

    def get_explanation(self, obj):
        return explanations.explain(obj.condition, obj.severity)

    def get_short_summary(self, obj):
        return explanations.short_summary(obj.severity)


class StudySerializer(serializers.ModelSerializer):
    points = LevelPointSerializer(many=True, read_only=True)
    predictions = PredictionSerializer(many=True, read_only=True)

    class Meta:
        model = Study
        fields = [
            'id', 'patient_ref', 'image', 'uploaded_at',
            'risk_tier', 'risk_reason', 'model_version',
            'is_valid_mri', 'rejection_reason',
            'points', 'predictions',
        ]
        read_only_fields = [
            'risk_tier', 'risk_reason', 'model_version',
            'is_valid_mri', 'rejection_reason',
        ]
