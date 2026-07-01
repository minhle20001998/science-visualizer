export function Schematic2D({ vgs, vds, isOn }: { vgs: number; vds: number; isOn: boolean }) {
  const dotCount = 10
  const dur = `${Math.max(0.4, 3 - vds * 0.5)}s`
  const stagger = parseFloat(dur) / dotCount

  return (
    <svg viewBox="-120 -120 240 240" width="100%" height="100%" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Central circle */}
      <circle cx="0" cy="0" r="55" fill="none" stroke={isOn ? '#00ffee' : '#666'} strokeWidth="1.5" opacity={isOn ? 0.8 : 0.4} />

      {/* Gate wire + bar */}
      <line x1="-90" y1="0" x2="-46" y2="0" stroke="#aaa" strokeWidth="2" />
      <line x1="-46" y1="-22" x2="-46" y2="22" stroke="#ccc" strokeWidth="3" strokeLinecap="round" />

      {/* Channel segments */}
      <line x1="0" y1="-28" x2="0" y2="-12" stroke={isOn ? '#00ffee' : '#555'} strokeWidth="2.5" strokeDasharray={isOn ? 'none' : '4,3'} strokeLinecap="round" filter={isOn ? 'url(#glow)' : undefined} />
      <line x1="0" y1="-5" x2="0" y2="5" stroke={isOn ? '#00ffee' : '#555'} strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="-8,-4 0,0 -8,4" fill={isOn ? '#00ffee' : '#555'} opacity={isOn ? 1 : 0.5} />
      <line x1="0" y1="12" x2="0" y2="28" stroke={isOn ? '#00ffee' : '#555'} strokeWidth="2.5" strokeDasharray={isOn ? 'none' : '4,3'} strokeLinecap="round" filter={isOn ? 'url(#glow)' : undefined} />

      {/* Drain wire + node */}
      <line x1="0" y1="-28" x2="0" y2="-75" stroke="#aaa" strokeWidth="2" />
      <circle cx="0" cy="-85" r="5" fill="#1a1a2a" stroke="#aaa" strokeWidth="2" />

      {/* Source wire + node */}
      <line x1="0" y1="28" x2="0" y2="75" stroke="#aaa" strokeWidth="2" />
      <circle cx="0" cy="85" r="5" fill="#1a1a2a" stroke="#aaa" strokeWidth="2" />

      {/* Gate node */}
      <circle cx="-90" cy="0" r="5" fill="#1a1a2a" stroke="#aaa" strokeWidth="2" />

      {/* Continuous electron stream: spawn at Source (cy=75), flow up channel, vanish past Drain (cy=-90) */}
      {isOn && vds > 0 && Array.from({ length: dotCount }).map((_, i) => (
        <circle key={i} r="3" fill="#00ffcc" opacity="0.9" filter="url(#glow)">
          <animate
            attributeName="cy"
            values="75;-90"
            dur={dur}
            begin={`${i * stagger}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0.95;0.95;0"
            keyTimes="0;0.1;0.8;1"
            dur={dur}
            begin={`${i * stagger}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* Labels */}
      <g>
        <rect x="8" y="-90" width="80" height="14" rx="2" fill="#1a1a2a" opacity="0.7" />
        <text x="12" y="-79" fill="#eee" fontSize="12" fontWeight={600}>Drain (D)</text>
      </g>
      <rect x="8" y="-74" width="54" height="12" rx="2" fill="#1a1a2a" opacity="0.7" />
      <text x="12" y="-64" fill={vds > 0 ? '#4af0ff' : '#555'} fontSize="10" fontWeight={500}>{vds.toFixed(1)}V</text>

      <g>
        <rect x="-96" y="22" width="72" height="14" rx="2" fill="#1a1a2a" opacity="0.7" />
        <text x="-92" y="33" fill="#eee" fontSize="12" fontWeight={600}>Gate (G)</text>
      </g>
      <rect x="-96" y="38" width="54" height="12" rx="2" fill="#1a1a2a" opacity="0.7" />
      <text x="-92" y="48" fill={vgs > 0 ? '#ffd93d' : '#555'} fontSize="10" fontWeight={500}>{vgs.toFixed(1)}V</text>

      <g>
        <rect x="8" y="82" width="78" height="14" rx="2" fill="#1a1a2a" opacity="0.7" />
        <text x="12" y="93" fill="#eee" fontSize="12" fontWeight={600}>Source (S)</text>
      </g>

      <text x="0" y="112" textAnchor="middle" fill={isOn ? '#00ffee' : '#888'} fontSize="15" fontWeight={700}>
        {isOn ? '● ON' : '○ OFF'}
      </text>
    </svg>
  )
}
