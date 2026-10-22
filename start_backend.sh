#!/usr/bin/env bash
# Sets up and runs the Django backend.
# Run from the repo root: ./start_backend.sh
set -e

cd "$(dirname "$0")/backend"

if [ ! -d venv ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate
echo "Installing backend dependencies..."
pip install -q -r requirements.txt

echo "Applying database migrations..."
python manage.py migrate

echo ""
echo "Model artifacts in ml_artifacts/:"
ls -la ml_artifacts/*.onnx ml_artifacts/*.json 2>/dev/null || echo "  (none found — see README)"
echo ""
echo "Starting Django on http://localhost:8000 ..."
python manage.py runserver
