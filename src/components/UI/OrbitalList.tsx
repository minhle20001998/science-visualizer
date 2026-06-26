import { useMemo } from 'react'
import { getElectronConfig } from '../../algorithms/electronConfig'
import { assignElectrons } from '../../algorithms/orbitalPaths'
import { useStore } from '../../store/useStore'

const SHAPE_COLORS: Record<string, string> = {
  s: '#4a9eff',
  p: '#ff6b6b',
  d: '#ffd93d',
  f: '#a66cff',
}

const SHAPE_LABEL: Record<number, string> = {
  0: 's',
  1: 'p',
  2: 'd',
  3: 'f',
}

const P_AXIS_NAMES = ['pₓ', 'pᵧ', 'p_z']
const D_AXIS_NAMES = ['d_z²', 'd_xz', 'd_yz', 'd_xy', 'd_x²-y²']
const F_AXIS_NAMES = ['f_z³', 'f_xz²', 'f_yz²', 'f_xyz', 'f_z(x²-y²)', 'f_x(x²-3y²)', 'f_y(3x²-y²)']

export function OrbitalList() {
  const atomicNumber = useStore((s) => s.atomicNumber)
  const highlightedOrbitals = useStore((s) => s.highlightedOrbitals)
  const toggleHighlight = useStore((s) => s.toggleHighlight)
  const clearHighlights = useStore((s) => s.clearHighlights)

  const config = useMemo(() => getElectronConfig(atomicNumber), [atomicNumber])
  const electrons = useMemo(() => assignElectrons(config), [config])

  const spinCounts = useMemo(() => {
    const map = new Map<string, { up: number; down: number }>()
    for (const e of electrons) {
      const key = e.shape === 's' ? e.label : `${e.label}_${e.axisIndex}`
      const entry = map.get(key) ?? { up: 0, down: 0 }
      if (e.spin === '↑') entry.up++
      else entry.down++
      map.set(key, entry)
    }
    return map
  }, [electrons])

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      left: '24px',
      zIndex: 50,
      background: 'var(--card-bg)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--card-border)',
      borderRadius: '10px',
      padding: '14px 16px',
      minWidth: '90px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
      }}>
        <span style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--text-dim)',
        }}>
          Orbitals
        </span>
        {highlightedOrbitals.length > 0 && (
          <span
            onClick={clearHighlights}
            style={{
              fontSize: '10px',
              color: 'var(--accent)',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}
          >
            Clear
          </span>
        )}
      </div>
      <div style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
        {config.map((sub) => {
        const shapeLabel = SHAPE_LABEL[sub.l] ?? '?'
        const color = SHAPE_COLORS[shapeLabel] ?? '#888'
        const numAxes = sub.l === 0 ? 1 : sub.l === 1 ? 3 : sub.l === 2 ? 5 : 7
        const axisNames = sub.l === 1 ? P_AXIS_NAMES : sub.l === 2 ? D_AXIS_NAMES : sub.l === 3 ? F_AXIS_NAMES : []
        const rows = sub.l >= 1
          ? Array.from({ length: numAxes }, (_, a) => {
              const key = `${sub.label}_${a}`
              return {
                key,
                label: `${sub.label} ${axisNames[a] ?? `#${a}`}`,
              }
            })
          : [{ key: sub.label, label: sub.label }]
        return rows.map((row) => {
          const isActive = highlightedOrbitals.includes(row.key)
          const spins = spinCounts.get(row.key)
          const total = spins ? spins.up + spins.down : 0
          return (
            <div
              key={row.key}
              onClick={() => toggleHighlight(row.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                padding: '5px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                transition: 'background 0.15s',
                marginBottom: '2px',
                paddingLeft: sub.l > 0 ? '16px' : '8px',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? color : 'var(--text)',
              }}>
                {row.label}
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>
                  {total}
                </span>
                {total > 0 && (
                  <span style={{ fontSize: '12px', lineHeight: 1 }}>
                    {spins!.up > 0 && (
                      <span style={{ color: '#4af0ff', marginRight: spins!.down > 0 ? '1px' : 0 }}>↑</span>
                    )}
                    {spins!.down > 0 && (
                      <span style={{ color: '#ff6b6b' }}>↓</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          )
        })
      })}
      </div>
      <div style={{
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: 'var(--text-dim)',
      }}>
        <span>Total</span>
        <span>{atomicNumber}</span>
      </div>
    </div>
  )
}
