# Spinova — Lumbar spine screening web app

Django + React app for the clinical-facing half of the lumbar spine
degenerative detection project. Pairs with the training notebook
(`ML_Based_detection_system_for_LSD_resumable.ipynb`).

**Status: fully wired and ready to run.** The four ONNX/config artifacts
exported from the Kaggle training notebook (Phases 11H/11H2/11J) are already
placed in `backend/ml_artifacts/`, and the database migration is checked in
— so `./start_backend.sh` and `./start_frontend.sh` bring up a working,
end-to-end system with the real trained model, not mock data.

## Quick start (2 terminals)

```bash
# Terminal 1 — Django API + ONNX model, http://localhost:8000
./start_backend.sh

# Terminal 2 — React app, http://localhost:5173
./start_frontend.sh
```

Then open **http://localhost:5173** in a browser, sign in (any email/
password — see "What's real vs. demo" below), upload an MRI image on the
`/workspace` dashboard, click points for the levels/conditions you want
screened, and hit "Run screening." That request goes through the real
gatekeeper + severity ONNX models and returns live predictions.

The two scripts create a virtualenv / run `npm install`, apply migrations,
and start each dev server — safe to re-run any time.

## Model artifacts included

```
backend/ml_artifacts/
  student_model.onnx           quantized INT8 severity classifier
  model_config.json            IMG_SIZE, CROP_FRAC, class names, norm stats
  gatekeeper_backbone.onnx      MobileNetV3-Small embedding backbone
  gate_config.json             reference stats + reject threshold
```
These came from the notebook's `EDGE_DIR` (`results/outputs/edge_model/`)
after a successful `Save & Run All` commit. If you retrain and want to
refresh them, just copy the new files over these four — no code changes
needed; `api/inference.py` reads config values (`IMG_SIZE`, class names,
normalization stats, gate threshold) from the JSON files rather than
hardcoding them.

## Structure

```
lsd-webapp/
  frontend/   React + Vite + React Router site (marketing pages + dashboard)
  backend/    Django + DRF API (studies, points, predictions)
```

## Site map (frontend)

Each part of the site is now its own route, not one long scrolling page:

| Route | Page | Notes |
|---|---|---|
| `/` | Home | Short hero + a 3-step teaser. No sign-in required. |
| `/about` | About the disease | The conditions overview, moved off the home page. |
| `/how-it-works` | How it works | Expanded walkthrough of the 3-step flow. |
| `/signin` | Sign in / create account | Redirects to `/workspace` once "signed in". |
| `/workspace` | Study review (dashboard) | Requires being "signed in"; redirects to `/signin` otherwise. |

A floating **Home** button (bottom-left) appears on every page except `/`,
so there's always a fast way back regardless of how deep someone navigates.
Page-to-page navigation uses React Router's `<Link>`/`<NavLink>` (no full
page reloads) with a short fade/slide transition on every route change.

## Run it manually (equivalent to the start scripts)

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate   # migration is checked in — no makemigrations needed
python manage.py runserver
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Vite proxies `/api` to `localhost:8000` (see `vite.config.js`), so the two
run side by side in dev.

## What's real vs. demo right now

- **All 5 pages, navigation, and the Home button** — fully built and live.
- **Dashboard (`/workspace`)** — no more mock data. Choosing a file uploads
  it to Django immediately (`POST /api/studies/`), you mark points directly
  on the real image (`ImageMarker.jsx`), and "Run screening" calls
  `POST /api/studies/<id>/predict/` and renders whatever the model actually
  returns — severities, confidence, risk tier, and gatekeeper rejections are
  all live, not hardcoded. See `src/api.js` for the fetch layer.
- **Point marking on the image** — built. `ImageMarker.jsx` renders the
  uploaded image, lets you pick a level + condition, and click the exact
  spot to screen — one point per level+condition (up to 25 per study),
  matching the notebook's `train_label_coordinates.csv` scheme (central
  canal stenosis and left/right foraminal narrowing sit at different spots,
  so each needs its own click). Existing points are drawn as small dots you
  can click again to remove.
- **MRI gatekeeper** — wired end to end. `predict_study` now calls
  `inference.gate_check()` (Phase 11H2's exported MobileNetV3 embedding +
  novelty distance) before running severity models, and the dashboard shows
  the rejection banner from the real response instead of a placeholder. If
  `gatekeeper_backbone.onnx`/`gate_config.json` aren't deployed, every study
  is treated as valid (logged as a warning) so the severity model still
  works on its own.
- **Sign in (`/signin`)** — the form works and takes you into the
  dashboard, but there's no real backend auth yet (see `SignInPage.jsx`);
  any email/password combo "signs in".
- **Django API** (`upload_study`, `get_study`, `predict_study`) — functional
  end to end. `student_model.onnx`, `model_config.json`,
  `gatekeeper_backbone.onnx`, and `gate_config.json` are already in
  `backend/ml_artifacts/`, so `predict_study` runs the real trained model,
  not a stub.

## Next steps, in order

1. ~~Copy the four model artifacts into `backend/ml_artifacts/`~~ — done,
   already included in this package (from the notebook's `EDGE_DIR` /
   `results/outputs/edge_model/`).
2. ~~Run migrations~~ — the initial migration is checked in
   (`api/migrations/0001_initial.py`); `./start_backend.sh` (or
   `python manage.py migrate`) applies it against a fresh `db.sqlite3`.
3. Replace `SignInPage.jsx`'s local `onEnter` with a real
   `fetch('/api/auth/login/')` once Django has an auth endpoint — there is
   no real authentication yet, so don't deploy this publicly as-is.
4. Get the risk-tier thresholds (currently a draft in both the notebook and
   `api/inference.py`) and the gatekeeper's reject threshold reviewed by a
   clinician before they're shown as anything other than illustrative —
   the UI already labels the risk tier as a draft rule set.
5. Consider batching predict requests or adding a progress indicator per
   point if a full 25-point study takes more than a second or two on CPU —
   right now `predict_study` runs the ONNX session once per point,
   sequentially.
6. If you retrain in the notebook, copy the four refreshed files from
   `EDGE_DIR` over the ones in `backend/ml_artifacts/` — no code changes
   needed, everything reads from the JSON configs.

