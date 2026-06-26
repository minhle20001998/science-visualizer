import { useStore } from '../../store/useStore'

export function SpeedSlider() {
  const speed = useStore((s) => s.speed)
  const setSpeed = useStore((s) => s.setSpeed)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      minWidth: '180px',
    }}>
      <span style={{ fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
        Speed
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={speed}
        onChange={(e) => setSpeed(parseFloat(e.target.value))}
        style={{ flex: 1 }}
      />
      <span style={{
        fontSize: '12px',
        color: 'var(--text)',
        fontVariantNumeric: 'tabular-nums',
        minWidth: '32px',
        textAlign: 'right',
      }}>
        {Math.round(speed * 10000)}%
      </span>
    </div>
  )
}
