import { useRef, useState, type MouseEvent } from 'react'
import { LEVELS } from './SpineDiagram'

export const CONDITIONS = [
  { name: 'Spinal Canal Stenosis', code: 'SCS' },
  { name: 'Left Neural Foraminal Narrowing', code: 'L-NF' },
  { name: 'Right Neural Foraminal Narrowing', code: 'R-NF' },
  { name: 'Left Subarticular Stenosis', code: 'L-SS' },
  { name: 'Right Subarticular Stenosis', code: 'R-SS' },
]

const CODE_BY_NAME = Object.fromEntries(CONDITIONS.map((c) => [c.name, c.code]))

type MarkerPoint = {
  level: string
  condition: string
  x: number
  y: number
}

interface ImageMarkerProps {
  imageSrc: string
  points: MarkerPoint[]
  level: string
  condition: string
  onLevelChange: (value: string) => void
  onConditionChange: (value: string) => void
  onAddPoint: (level: string, condition: string, x: number, y: number) => void
  onRemovePoint: (index: number) => void
}

export default function ImageMarker({
  imageSrc,
  points,
  level,
  condition,
  onLevelChange,
  onConditionChange,
  onAddPoint,
  onRemovePoint,
}: ImageMarkerProps) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)

  const handleLoad = () => {
    const img = imgRef.current
    if (img) setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
  }

  const handleClick = (e: MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current
    if (!img || !naturalSize) return
    const rect = img.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const relY = (e.clientY - rect.top) / rect.height
    if (relX < 0 || relX > 1 || relY < 0 || relY > 1) return
    onAddPoint(level, condition, relX * naturalSize.w, relY * naturalSize.h)
  }

  const markedForLevel = new Set(points.filter((p) => p.level === level).map((p) => p.condition))

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold text-slate-700">
          Level
          <select
            value={level}
            onChange={(e) => onLevelChange(e.target.value)}
            className="h-12 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
          >
            {LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl} {points.some((p) => p.level === lvl) ? '•' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-semibold text-slate-700">
          Condition
          <select
            value={condition}
            onChange={(e) => onConditionChange(e.target.value)}
            className="h-12 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
          >
            {CONDITIONS.map((c) => (
              <option key={c.name} value={c.name}>
                {markedForLevel.has(c.name) ? '✓ ' : ''}
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
        Click the image where <strong>{condition}</strong> should be assessed at <strong>{level}</strong>. Clicking again replaces that point.
      </p>

      <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950/5 shadow-soft">
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Uploaded lumbar spine study"
          onLoad={handleLoad}
          onClick={handleClick}
          draggable={false}
          className="block w-full object-contain"
        />

        {naturalSize &&
          points.map((p, i) => {
            const left = (p.x / naturalSize.w) * 100
            const top = (p.y / naturalSize.h) * 100
            const isCurrentLevel = p.level === level
            return (
              <button
                key={`${p.level}-${p.condition}`}
                type="button"
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg transition ${
                  isCurrentLevel ? 'bg-navy' : 'bg-teal'
                } hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal`}
                style={{ left: `${left}%`, top: `${top}%` }}
                title={`${p.level} · ${p.condition} — click to remove`}
                onClick={(e) => {
                  e.stopPropagation()
                  onRemovePoint(i)
                }}
              >
                {CODE_BY_NAME[p.condition]}
              </button>
            )
          })}
      </div>

      <p className="text-sm leading-6 text-slate-600">
        {points.length} of 25 points marked{points.length > 0 && ' — click a marker to remove it.'}
      </p>
    </div>
  )
}
