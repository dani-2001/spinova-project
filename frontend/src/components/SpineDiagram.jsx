import { useMemo } from 'react'

// Five disc levels the model screens, top to bottom
const LEVELS = ['L1/L2', 'L2/L3', 'L3/L4', 'L4/L5', 'L5/S1']

const SEVERITY_COLOR = {
  'Normal/Mild': '#0F6E56',
  'Moderate': '#BA7517',
  'Severe': '#A32D2D',
  'Unknown': '#9C9A91',
}

// y-position of each disc space along the drawn column, and the vertebral
// body centres above/below it
const VERTEBRA_Y = [40, 96, 152, 208, 264, 320] // L1..L5, S1
const DISC_Y = [68, 124, 180, 236, 292]          // L1/L2 .. L5/S1

export default function SpineDiagram({ levelSeverity, activeLevel, onSelectLevel }) {
  const bodies = useMemo(
    () => ['L1', 'L2', 'L3', 'L4', 'L5', 'S1'],
    []
  )

  return (
    <svg
      viewBox="0 0 260 360"
      width="100%"
      role="img"
      aria-label="Diagram of the lumbar spine, L1 through S1, with each disc level colour-coded by predicted severity"
      style={{ maxWidth: 260, display: 'block', margin: '0 auto' }}
    >
      <title>Lumbar spine level diagram</title>

      {/* spinal column guide line */}
      <line x1="130" y1="30" x2="130" y2="336" stroke="#D8D5C9" strokeWidth="10" strokeLinecap="round" />

      {/* vertebral bodies */}
      {bodies.map((label, i) => (
        <g key={label}>
          <rect
            x="92" y={VERTEBRA_Y[i] - 16} width="76" height="32" rx="8"
            fill="#EFEDE4" stroke="#C7C4B6" strokeWidth="1.5"
          />
          <text x="130" y={VERTEBRA_Y[i] + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill="#5F5E5A">
            {label}
          </text>
        </g>
      ))}

      {/* disc spaces — clickable, colour-coded, pulse when active */}
      {LEVELS.map((level, i) => {
        const severity = levelSeverity[level] || 'Unknown'
        const color = SEVERITY_COLOR[severity]
        const isActive = activeLevel === level
        return (
          <g
            key={level}
            onClick={() => onSelectLevel(level)}
            style={{ cursor: 'pointer' }}
            tabIndex={0}
            role="button"
            aria-label={`${level}, predicted ${severity}`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectLevel(level) }}
          >
            {isActive && (
              <ellipse
                cx="130" cy={DISC_Y[i]} rx="46" ry="12" fill={color} opacity="0.25"
                className="disc-pulse"
              />
            )}
            <ellipse
              cx="130" cy={DISC_Y[i]} rx="40" ry="9"
              fill={color} opacity={isActive ? 1 : 0.55}
              stroke={isActive ? '#14181C' : 'transparent'} strokeWidth="1.5"
              style={{ transition: 'fill 0.35s ease, opacity 0.35s ease, stroke 0.35s ease' }}
            />
            <text
              x="184" y={DISC_Y[i] + 4} fontSize="11" fontWeight={isActive ? 600 : 400}
              fill={isActive ? '#14181C' : '#5F5E5A'}
            >
              {level}
            </text>
          </g>
        )
      })}

      <style>{`
        .disc-pulse {
          transform-box: fill-box;
          transform-origin: center;
          animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse {
          0%   { transform: scale(1);   opacity: 0.35; }
          50%  { transform: scale(1.35); opacity: 0.08; }
          100% { transform: scale(1);   opacity: 0.35; }
        }
        @media (prefers-reduced-motion: reduce) {
          .disc-pulse { animation: none; }
        }
      `}</style>
    </svg>
  )
}

export { LEVELS }
