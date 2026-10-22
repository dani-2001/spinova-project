from django.urls import path
from . import views

urlpatterns = [
    path('studies/', views.upload_study, name='upload-study'),
    path('studies/<int:study_id>/', views.get_study, name='get-study'),
    path('studies/<int:study_id>/detect-levels/', views.detect_levels, name='detect-levels'),
    path('studies/<int:study_id>/predict/', views.predict_study, name='predict-study'),
    path('studies/<int:study_id>/report/', views.download_report, name='download-report'),
]
