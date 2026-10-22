#!/usr/bin/env bash
# Installs and runs the React (Vite) frontend.
# Run from the repo root: ./start_frontend.sh
set -e

cd "$(dirname "$0")/frontend"

echo "Installing frontend dependencies..."
npm install

echo ""
echo "Starting Vite dev server on http://localhost:5173 ..."
echo "(Make sure the backend is already running on http://localhost:8000)"
npm run dev
