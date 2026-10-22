// Small, on-brand illustrations for the home page — drawn in the app's own
// navy/teal/amber palette instead of stock photography, so there's no
// licensing question and they stay crisp at any size.

export function ScanReviewIllustration() {
  return (
    <svg
      viewBox="0 0 420 340"
      role="img"
      aria-label="Illustration of a clinician reviewing a lumbar spine MRI on a monitor"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <title>Clinician reviewing a lumbar spine MRI</title>

      {/* backdrop */}
      <rect x="0" y="0" width="420" height="340" rx="20" fill="#0F2A43" />
      <circle cx="360" cy="40" r="70" fill="#163A5C" opacity="0.6" />
      <circle cx="20" cy="300" r="90" fill="#163A5C" opacity="0.5" />

      {/* monitor */}
      <rect x="70" y="56" width="220" height="152" rx="8" fill="#F7F6F1" />
      <rect x="82" y="68" width="196" height="112" rx="4" fill="#0B1E30" />
      {/* spine trace on screen */}
      <g stroke="#4FD1A5" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M180 76 L176 92 L184 108 L174 124 L184 140 L176 156 L180 170" />
      </g>
      {[86, 104, 122, 140, 158].map((y, i) => (
        <rect key={y} x="150" y={y} width="60" height="10" rx="2"
          fill={i === 3 ? '#E7A23A' : '#2E4A63'} opacity={i === 3 ? 1 : 0.8} />
      ))}
      <rect x="70" y="208" width="220" height="14" rx="4" fill="#0B1E30" />
      <rect x="150" y="222" width="60" height="10" fill="#0B1E30" />
      <rect x="130" y="232" width="100" height="8" rx="4" fill="#0B1E30" />

      {/* side readout panel */}
      <rect x="300" y="56" width="70" height="152" rx="8" fill="#F7F6F1" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="312" y={76 + i * 24} width="46" height="12" rx="3"
          fill={i === 2 ? '#E7A23A' : '#0F6E56'} opacity={i === 2 ? 0.9 : 0.55} />
      ))}

      {/* clinician, simple flat figure */}
      <g>
        <circle cx="128" cy="268" r="20" fill="#F2C9A0" />
        <path d="M92 336 C92 296 108 280 128 280 C148 280 164 296 164 336 Z" fill="#0F6E56" />
        <path d="M108 300 L86 316" stroke="#0F6E56" strokeWidth="10" strokeLinecap="round" />
        <circle cx="82" cy="320" r="6" fill="#F2C9A0" />
      </g>
      <g>
        <circle cx="230" cy="270" r="18" fill="#D8A374" />
        <path d="M198 336 C198 300 212 286 230 286 C248 286 262 300 262 336 Z" fill="#854F0B" />
      </g>

      {/* clipboard */}
      <rect x="196" y="300" width="34" height="26" rx="3" fill="#F7F6F1" />
      <rect x="201" y="306" width="24" height="3" fill="#9C9A91" />
      <rect x="201" y="312" width="24" height="3" fill="#9C9A91" />
      <rect x="201" y="318" width="16" height="3" fill="#9C9A91" />
    </svg>
  )
}

export function ClinicIllustration() {
  return (
    <svg
      viewBox="0 0 420 260"
      role="img"
      aria-label="Illustration of a district hospital building"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <title>District hospital building</title>

      <rect x="0" y="0" width="420" height="260" rx="20" fill="#F7F6F1" />
      <rect x="0" y="196" width="420" height="64" fill="#E1F5EE" />

      {/* main building */}
      <rect x="90" y="86" width="240" height="112" fill="#FFFFFF" stroke="#E4E1D6" strokeWidth="2" />
      <polygon points="80,86 210,40 340,86" fill="#0F2A43" />
      <rect x="196" y="52" width="28" height="18" fill="#F7F6F1" />

      {/* cross emblem */}
      <rect x="200" y="98" width="20" height="46" rx="3" fill="#A32D2D" />
      <rect x="187" y="111" width="46" height="20" rx="3" fill="#A32D2D" />

      {/* windows */}
      <rect x="112" y="150" width="20" height="20" rx="2" fill="#0F6E56" />
      <rect x="166" y="150" width="20" height="20" rx="2" fill="#BFE3D6" />
      <rect x="274" y="150" width="20" height="20" rx="2" fill="#BFE3D6" />
      <rect x="220" y="150" width="20" height="20" rx="2" fill="#0F6E56" />

      {/* door */}
      <rect x="196" y="164" width="28" height="34" fill="#0F2A43" />

      {/* ambulance */}
      <g>
        <rect x="34" y="180" width="60" height="26" rx="4" fill="#FFFFFF" stroke="#E4E1D6" strokeWidth="2" />
        <rect x="34" y="168" width="30" height="18" rx="3" fill="#FFFFFF" stroke="#E4E1D6" strokeWidth="2" />
        <rect x="52" y="186" width="10" height="10" fill="#A32D2D" />
        <rect x="48" y="190" width="18" height="4" fill="#A32D2D" />
        <circle cx="48" cy="208" r="7" fill="#0F2A43" />
        <circle cx="82" cy="208" r="7" fill="#0F2A43" />
      </g>

      {/* tree */}
      <circle cx="368" cy="176" r="20" fill="#0F6E56" opacity="0.85" />
      <rect x="364" y="192" width="8" height="18" fill="#854F0B" />
    </svg>
  )
}
