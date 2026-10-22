import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LEVELS } from './SpineDiagram'
import { uploadStudy, detectLevels, predictStudy } from '../api'

type DetectionBox = {
  level: string
  x: number
  y: number
  width: number
  height: number
}

type DragState = {
  index: number
  originX: number
  originY: number
  startX: number
  startY: number
}

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
function ScanIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
function PatientsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19c.7-3.4 3-5 5.5-5s4.8 1.6 5.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.5 6.2A3 3 0 0 1 17 12M17.5 14c2 .5 3.3 2 3.8 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function ReportsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3.5h9l3 3V19a1.2 1.2 0 0 1-1.2 1.2H6A1.2 1.2 0 0 1 4.8 19V4.7A1.2 1.2 0 0 1 6 3.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 12h7M8.5 15.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 15V4M8 8l4-4 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: DashboardIcon, enabled: true },
  { key: 'new-scan', label: 'New scan', icon: ScanIcon, enabled: false },
  { key: 'patients', label: 'Patients', icon: PatientsIcon, enabled: false },
  { key: 'reports', label: 'Reports', icon: ReportsIcon, enabled: false },
  { key: 'settings', label: 'Settings', icon: SettingsIcon, enabled: false },
]

const CONDITIONS = [
  'Spinal Canal Stenosis',
  'Left Neural Foraminal Narrowing',
  'Right Neural Foraminal Narrowing',
  'Left Subarticular Stenosis',
  'Right Subarticular Stenosis',
]

const CONDITION_NOTES = {
  'Spinal Canal Stenosis': 'Narrowing of the central canal that can press on the spinal cord or cauda equina.',
  'Left Neural Foraminal Narrowing': 'Narrowing of the left-side opening where a nerve root exits the spine.',
  'Right Neural Foraminal Narrowing': 'Narrowing of the right-side opening where a nerve root exits the spine.',
  'Left Subarticular Stenosis': 'Narrowing of the left lateral recess, near the base of the nerve root.',
  'Right Subarticular Stenosis': 'Narrowing of the right lateral recess, near the base of the nerve root.',
}

const SEVERITY_BADGE_CLASS = {
  'Normal/Mild': 'badge-normal',
  'Moderate': 'badge-moderate',
  'Severe': 'badge-severe',
}

const SEVERITY_RANK = { 'Normal/Mild': 0, 'Moderate': 1, 'Severe': 2 }

const TIER_COLOR = {
  'Low': '#0F6E56',
  'Low-Moderate': '#639922',
  'Moderate': '#BA7517',
  'Moderate-High': '#D85A30',
  'High': '#A32D2D',
}

function worstAtLevel(levelPredictions) {
  return Object.entries(levelPredictions).reduce(
    (worst, [cond, pred]) => {
      if (!pred.severity) return worst
      return SEVERITY_RANK[pred.severity] > SEVERITY_RANK[worst.sev] ? { cond, sev: pred.severity } : worst
    },
    { cond: null, sev: 'Normal/Mild' }
  )
}

function initials(name) {
  const parts = name.trim().split(/\s+/)
  return (parts[0]?.[0] ?? '').concat(parts[1]?.[0] ?? '').toUpperCase() || 'DR'
}

export default function Workspace({ user, onSignOut }) {
  const navigate = useNavigate()

  // ---- upload state ----
  const [file, setFile] = useState<File | null>(null)
  const [patientRef, setPatientRef] = useState('')
  const [studyId, setStudyId] = useState<number | null>(null)
  // 'idle' -> 'uploading' -> 'detecting' -> 'screening' -> 'done' | 'rejected'
  // plus 'error' on any failed request.
  const [status, setStatus] = useState<'idle' | 'uploading' | 'detecting' | 'screening' | 'done' | 'rejected' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [detectedLevels, setDetectedLevels] = useState<DetectionBox[]>([])
  const [editingLevels, setEditingLevels] = useState(false)
  const [dragState, setDragState] = useState<DragState | null>(null)

  // ---- results state ----
  const [studyData, setStudyData] = useState<any>(null) // raw StudySerializer payload
  const [activeLevel, setActiveLevel] = useState('L4/L5')

  const imageUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  const imageContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  useEffect(() => {
    if (!dragState) return

    const handlePointerMove = (event: PointerEvent) => {
      if (!imageContainerRef.current) return
      const rect = imageContainerRef.current.getBoundingClientRect()
      const deltaX = (event.clientX - dragState.originX) / rect.width
      const deltaY = (event.clientY - dragState.originY) / rect.height

      setDetectedLevels((current) =>
        current.map((box, index) => {
          if (index !== dragState.index) return box
          return {
            ...box,
            x: Math.min(Math.max(dragState.startX + deltaX, 0), 1 - box.width),
            y: Math.min(Math.max(dragState.startY + deltaY, 0), 1 - box.height),
          }
        })
      )
    }

    const handlePointerUp = () => setDragState(null)

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragState])

  const getBoxStyle = (box: DetectionBox) => ({
    left: `${box.x * 100}%`,
    top: `${box.y * 100}%`,
    width: `${box.width * 100}%`,
    height: `${box.height * 100}%`,
  })

  const resetForNewFile = () => {
    setStudyId(null)
    setDetectedLevels([])
    setStudyData(null)
    setErrorMessage(null)
    setEditingLevels(false)
    setStatus('idle')
    setActiveLevel('L4/L5')
  }

  const detectDiscLevels = async (studyId) => {
    setStatus('detecting')
    setErrorMessage(null)
    try {
      const response = await detectLevels(studyId)
      setDetectedLevels(response.levels ?? [])
      await runScreeningWithLevels(studyId, response.levels ?? [])
    } catch (error) {
      setStatus('error')
      setErrorMessage(error.message || 'Level detection failed — check backend connectivity.')
    }
  }

  const runScreeningWithLevels = async (studyId, levels) => {
    setStatus('screening')
    setErrorMessage(null)
    try {
      const result = await predictStudy(studyId, levels)
      setStudyData(result)
      setActiveLevel(levels[0]?.level || 'L4/L5')
      setStatus(result.is_valid_mri === false ? 'rejected' : 'done')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error.message || 'Screening failed — check that the trained model is deployed to the backend.')
    }
  }

  const chooseFile = async (e) => {
    const picked = e.target.files?.[0]
    if (!picked) return
    resetForNewFile()
    setFile(picked)
    setStatus('uploading')
    try {
      const study = await uploadStudy(picked, patientRef)
      setStudyId(study.id)
      await detectDiscLevels(study.id)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error.message || 'Could not upload the study — check that the Django backend is running.')
    }
  }

  const handleBoxPointerDown = (index, event) => {
    if (!editingLevels || !imageContainerRef.current) return
    event.preventDefault()
    setDragState({
      index,
      originX: event.clientX,
      originY: event.clientY,
      startX: detectedLevels[index].x,
      startY: detectedLevels[index].y,
    })
  }

  const applyAdjustedLevels = async () => {
    if (!studyId || detectedLevels.length === 0) return
    await runScreeningWithLevels(studyId, detectedLevels)
    setEditingLevels(false)
  }

  const signOut = () => {
    onSignOut()
    navigate('/')
  }

  // predictions keyed by level -> condition -> {severity, confidence, error}
  const predictionsByLevel = useMemo(() => {
    const map = Object.fromEntries(LEVELS.map((lvl) => [lvl, {}]))
    for (const p of studyData?.predictions ?? []) {
      if (!map[p.level]) map[p.level] = {}
      map[p.level][p.condition] = p
    }
    return map
  }, [studyData])

  const hasResults = status === 'done'
  const isRejected = status === 'rejected'

  const levelSeverity = Object.fromEntries(
    LEVELS.map((lvl) => {
      if (!hasResults) return [lvl, 'Unknown']
      const worst = worstAtLevel(predictionsByLevel[lvl] || {})
      return [lvl, worst.cond ? worst.sev : 'Unknown']
    })
  )

  const risk = hasResults && studyData ? { tier: studyData.risk_tier, reason: studyData.risk_reason } : null

  return (
    <div className="shell workspace-shell">
      <header className="workspace-topbar">
        <div className="workspace-brand-group">
          <div className="brand-mark">LS</div>
          <div>
            <div className="brand-name">Spinova</div>
            <p className="workspace-subtitle">Hospital-ready lumbar MRI screening for radiologists and spine specialists.</p>
          </div>
        </div>

        <div className="workspace-actions">
          <Link to="/" className="btn-ghost workspace-home-button">
            Home
          </Link>
          <div className="workspace-meta">
            <p className="workspace-meta-label">Study</p>
            <p className="workspace-meta-value">
              {patientRef ? `Patient ${patientRef}` : 'No patient reference'}
              {studyId ? ` · #${studyId}` : ''}
            </p>
          </div>
          <button type="button" className="btn-ghost workspace-signout" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="workspace-main">
        <section className="workspace-top-grid">
          <div className="card upload-card">
            <div className="card-header-row">
              <div>
                <h2>Upload MRI study</h2>
                <p className="muted small">
                  Review the full sagittal image in a responsive viewer, then mark the levels the model should screen.
                </p>
              </div>
              <span className="badge badge-normal">For radiology teams</span>
            </div>

            <label className={`dropzone ${file ? 'dropzone-filled' : ''}`}>
              <input type="file" accept=".dcm,image/*" onChange={chooseFile} hidden />
              <span className="dropzone-icon"><UploadIcon /></span>
              <div>
                <strong>{file ? file.name : 'Choose DICOM or exported MRI image'}</strong>
                <p className="muted tiny">Drag & drop or click to upload</p>
              </div>
            </label>

            <input
              type="text"
              className="patient-ref-input"
              placeholder="Patient reference (optional)"
              value={patientRef}
              onChange={(e) => setPatientRef(e.target.value)}
              disabled={status === 'uploading' || status === 'detecting' || status === 'screening'}
            />

            <div className="upload-actions-row">
              {(status === 'detecting' || status === 'screening') && studyId && (
                <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                  {status === 'detecting'
                    ? 'Detecting lumbar disc levels…'
                    : 'Running screening inference for all detected levels…'}
                </div>
              )}
              <p className="muted tiny upload-note">This tool supports review; it does not replace the radiologist’s read.</p>
            </div>

            {status === 'uploading' && (
              <p className="muted tiny run-status" aria-live="polite">Uploading study…</p>
            )}
            {status === 'error' && errorMessage && (
              <p className="reject-banner" role="alert">{errorMessage}</p>
            )}
            {isRejected && studyData?.rejection_reason && (
              <p className="reject-banner" role="alert">{studyData.rejection_reason}</p>
            )}
          </div>

          <div className="card risk-card workspace-risk-card">
            <h2>Risk summary</h2>
            {hasResults ? (
              <>
                <div className="tier-value" style={{ color: TIER_COLOR[risk.tier] || 'inherit' }}>{risk.tier}</div>
                <p className="muted small">{risk.reason}</p>
                <p className="muted tiny">Draft tiering logic built for hospital review workflows.</p>
              </>
            ) : isRejected ? (
              <>
                <div className="tier-value tier-value-empty">—</div>
                <p className="muted small">Not a valid lumbar spine MRI — see the message above.</p>
              </>
            ) : (
              <>
                <div className="tier-value tier-value-empty">—</div>
                <p className="muted small">Upload and mark at least one point to see the risk tier.</p>
              </>
            )}
            {(hasResults || isRejected) && studyId && (
              <a
                className="btn-primary report-download-btn"
                href={`/api/studies/${studyId}/report/`}
                download={`spinova-report-study-${studyId}.pdf`}
              >
                Download PDF report
              </a>
            )}
          </div>
        </section>

        <section className="workspace-body-grid">
          <aside className="card image-panel">
            <div className="card-header-row">
              <div>
                <h2>Full MRI viewer</h2>
                <p className="muted small">
                  {studyId
                    ? 'Detected lumbar levels are shown on the image. Adjust them manually if needed before re-running screening.'
                    : 'Upload a lumbar spine MRI to preview it here.'}
                </p>
              </div>
              <span className="badge badge-normal">Full image</span>
            </div>

            {studyId && imageUrl ? (
              <>
                <div className="marker-canvas" ref={imageContainerRef}>
                  <img src={imageUrl} alt="Uploaded lumbar spine study" draggable={false} className="block w-full object-contain" />

                  {detectedLevels.map((box, index) => (
                    <button
                      key={box.level}
                      type="button"
                      className={`absolute rounded-3xl border-2 px-2 py-1 text-[11px] font-semibold text-white shadow-lg transition ${
                        activeLevel === box.level
                          ? 'border-teal bg-teal/85'
                          : 'border-white/75 bg-slate-950/70'
                      }`}
                      style={getBoxStyle(box)}
                      onPointerDown={(event) => handleBoxPointerDown(index, event)}
                      onClick={(event) => {
                        event.preventDefault()
                        setActiveLevel(box.level)
                      }}
                    >
                      {box.level}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-3">
                  {detectedLevels.length ? (
                    <>
                      <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                        {editingLevels
                          ? 'Drag a box to reposition a detected level. When done, click Apply adjusted levels to re-run the screening.'
                          : 'The model has automatically detected the lumbar levels. Use edit mode to reposition any boxes.'}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => setEditingLevels((current) => !current)}
                          disabled={status === 'uploading' || status === 'detecting' || status === 'screening'}
                        >
                          {editingLevels ? 'Exit edit mode' : 'Edit detected levels'}
                        </button>
                        {editingLevels && (
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={applyAdjustedLevels}
                            disabled={status === 'uploading' || status === 'detecting' || status === 'screening'}
                          >
                            Apply adjusted levels
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                      Detected levels are being loaded. If this message remains, refresh the page or re-upload the study.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p className="muted small">Upload a lumbar spine MRI to preview it here.</p>
              </div>
            )}
          </aside>

          <aside className="card summary-panel">
            <div className="card-header-row">
              <div>
                <h2>Findings by level</h2>
                <p className="muted small">Review the model’s prediction for each scanned disc level.</p>
              </div>
            </div>

            {hasResults ? (
              <div className="fade-in-up">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Level</th>
                        {CONDITIONS.map((c) => <th key={c}>{c}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {LEVELS.map((level) => (
                        <tr
                          key={level}
                          className={level === activeLevel ? 'row-active' : ''}
                          onClick={() => setActiveLevel(level)}
                        >
                          <td className="level-cell">{level}</td>
                          {CONDITIONS.map((cond) => {
                            const pred = predictionsByLevel[level]?.[cond]
                            if (!pred) {
                              return <td key={cond}><span className="badge badge-unscreened">Not screened</span></td>
                            }
                            if (pred.error || !pred.severity) {
                              return <td key={cond}><span className="badge badge-unscreened" title={pred.error || ''}>Error</span></td>
                            }
                            return (
                              <td key={cond}>
                                <span className={`badge badge-${pred.severity.split('/')[0].toLowerCase()}`}>
                                  {pred.severity}
                                </span>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="findings-explanations">
                  <h3 className="findings-explanations-title">Findings at {activeLevel} — explained</h3>
                  {CONDITIONS.map((cond) => {
                    const pred = predictionsByLevel[activeLevel]?.[cond]
                    if (!pred || pred.error || !pred.severity) return null
                    return (
                      <div key={cond} className="condition-note">
                        <div className="condition-note-header">
                          <strong>{cond}</strong>
                          <span className={`badge ${SEVERITY_BADGE_CLASS[pred.severity] || 'badge-unscreened'}`}>
                            {pred.severity}
                          </span>
                        </div>
                        <p className="muted small">{pred.explanation || CONDITION_NOTES[cond]}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="table-empty">
                <p className="muted small">
                  {studyId
                    ? 'Mark at least one point above, then click "Run screening" to see findings by level here.'
                    : 'Upload a study to see findings by level here.'}
                </p>
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  )
}
