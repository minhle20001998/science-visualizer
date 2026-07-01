import { Vth } from '../../algorithms/transistorPhysics'

export function TransistorControls({
  vgs, vds, showDepletion, showBands,
  onVgsChange, onVdsChange, onDepletionToggle, onBandsToggle,
}: {
  vgs: number
  vds: number
  showDepletion: boolean
  showBands: boolean
  onVgsChange: (v: number) => void
  onVdsChange: (v: number) => void
  onDepletionToggle: () => void
  onBandsToggle: () => void
}) {
  return (
    <div style={{
      display: 'flex',
      gap: 24,
      alignItems: 'center',
      flexWrap: 'wrap',
      padding: '16px 24px',
      background: 'var(--card-bg)',
      borderRadius: 12,
      border: '1px solid var(--card-border)',
    }}>
      {/* Gate voltage slider */}
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#ffd93d', fontSize: 12, fontWeight: 600 }}>V<sub>GS</sub></span>
          <span style={{ color: '#eee', fontSize: 12, fontWeight: 600 }}>{vgs.toFixed(1)}V</span>
        </div>
        <div style={{ position: 'relative', height: 24 }}>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={vgs}
            onChange={(e) => onVgsChange(parseFloat(e.target.value))}
            style={{ width: '100%', height: 4, accentColor: vgs >= Vth ? '#00ffee' : '#ffd93d' }}
          />
          {/* Vth marker line */}
          <div style={{
            position: 'absolute',
            left: `${(Vth / 5) * 100}%`,
            top: 0,
            bottom: 0,
            width: 2,
            background: '#ffd93d',
            opacity: 0.7,
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            left: `${(Vth / 5) * 100}%`,
            top: -14,
            transform: 'translateX(-50%)',
            fontSize: 9,
            color: '#ffd93d',
            fontWeight: 600,
            pointerEvents: 'none',
          }}>Vth</div>
        </div>
      </div>

      {/* Drain voltage slider */}
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#4af0ff', fontSize: 12, fontWeight: 600 }}>V<sub>DS</sub></span>
          <span style={{ color: '#eee', fontSize: 12, fontWeight: 600 }}>{vds.toFixed(1)}V</span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={vds}
          onChange={(e) => onVdsChange(parseFloat(e.target.value))}
          style={{ width: '100%', height: 4, accentColor: '#4af0ff' }}
        />
      </div>

      {/* Toggle buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onDepletionToggle}
          style={{
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 600,
            color: showDepletion ? '#ff6666' : '#888',
            background: showDepletion ? 'rgba(255,100,100,0.12)' : 'rgba(255,255,255,0.04)',
            border: showDepletion ? '1px solid rgba(255,100,100,0.4)' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {showDepletion ? '◉ Depletion' : '○ Depletion'}
        </button>
        <button
          onClick={onBandsToggle}
          style={{
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 600,
            color: showBands ? '#c878ff' : '#888',
            background: showBands ? 'rgba(200,120,255,0.12)' : 'rgba(255,255,255,0.04)',
            border: showBands ? '1px solid rgba(200,120,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {showBands ? '◉ Bands' : '○ Bands'}
        </button>
      </div>
    </div>
  )
}
