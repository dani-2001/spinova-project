# Spinova — Lumbar spine screening web app

Spinova is a full-stack clinical decision-support project for lumbar spine degenerative screening. The repository contains a Django REST API, a React + Vite frontend, and trained ONNX inference models for evaluating MRI studies and highlighting likely lumbar spine conditions.

This project is designed to support image-based screening workflows in a clinical or research setting, with a dashboard for uploading MRI studies, marking anatomical points, and running model-based predictions across the relevant lumbar levels.

## Project overview

- Web app for lumbar spine MRI study review and screening
- Upload and annotate MRI images through a browser-based dashboard
- Run model inference using exported ONNX artifacts and JSON configuration files
- Provide a simple end-to-end workflow for demonstration, testing, and further development
- Intended as a research prototype and clinical-facing demo platform

Django + React app for the clinical-facing half of the lumbar spine
degenerative detection project. Pairs with the training notebook
(`ML_Based_detection_system_for_LSD_resumable.ipynb`).

**Status: fully wired and ready to run.** The four ONNX/config artifacts
exported from the Kaggle training notebook (Phases 11H/11H2/11J) are already
placed in `backend/ml_artifacts/`, and the database migration is checked in
— so `./start_backend.sh` and `./start_frontend.sh` bring up a working,
end-to-end system with the real trained model, not mock data.
