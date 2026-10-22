// Thin wrapper around the Django API. Vite proxies /api to localhost:8000
// in dev (see vite.config.js), so relative paths work in both dev and a
// same-origin production build.

const BASE = '/api'

async function handle(res) {
  let body = null
  try {
    body = await res.json()
  } catch {
    // no JSON body (e.g. a 502 from a proxy) — fall through with body=null
  }
  if (!res.ok) {
    const detail = body?.detail || `Request failed (${res.status})`
    const err = new Error(detail)
    err.status = res.status
    throw err
  }
  return body
}

/** POST /api/studies/  multipart: image, patient_ref */
export async function uploadStudy(file, patientRef) {
  const form = new FormData()
  form.append('image', file)
  if (patientRef) form.append('patient_ref', patientRef)
  const res = await fetch(`${BASE}/studies/`, { method: 'POST', body: form })
  return handle(res)
}

/** GET /api/studies/<id>/detect-levels/ */
export async function detectLevels(studyId) {
  const res = await fetch(`${BASE}/studies/${studyId}/detect-levels/`)
  return handle(res)
}

/** POST /api/studies/<id>/predict/  body: { detected_levels: [{level, x, y, width, height}] } */
export async function predictStudy(studyId, detectedLevels) {
  const res = await fetch(`${BASE}/studies/${studyId}/predict/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ detected_levels: detectedLevels }),
  })
  return handle(res)
}

/** GET /api/studies/<id>/ */
export async function getStudy(studyId) {
  const res = await fetch(`${BASE}/studies/${studyId}/`)
  return handle(res)
}
