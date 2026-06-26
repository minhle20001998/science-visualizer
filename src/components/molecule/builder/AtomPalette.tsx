import { useBuilderStore } from '../../../store/useBuilderStore'
import { getValence, getCpkColor } from '../../../algorithms/bondEngine'

const PALETTE_ELEMENTS = [
  { element: 'H' as const, name: 'Hydrogen' },
  { element: 'C' as const, name: 'Carbon' },
  { element: 'N' as const, name: 'Nitrogen' },
  { element: 'O' as const, name: 'Oxygen' },
  { element: 'F' as const, name: 'Fluorine' },
  { element: 'Cl' as const, name: 'Chlorine' },
  { element: 'Br' as const, name: 'Bromine' },
  { element: 'I' as const, name: 'Iodine' },
  { element: 'S' as const, name: 'Sulfur' },
  { element: 'P' as const, name: 'Phosphorus' },
  { element: 'Na' as const, name: 'Sodium' },
  { element: 'K' as const, name: 'Potassium' },
]

export function AtomPalette() {
  const activeElement = useBuilderStore((s) => s.activeElement)
  const setActiveElement = useBuilderStore((s) => s.setActiveElement)

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 50,
      width: '180px',
      background: 'var(--card-bg)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--card-border)',
      borderRadius: '10px',
      padding: '14px',
      color: 'var(--text)',
      fontSize: '12px',
      userSelect: 'none',
    }}>
      <div style={{
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: 'var(--text-dim)',
        marginBottom: '10px',
        opacity: 0.6,
      }}>
        Atom Palette
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        maxHeight: 'calc(100vh - 180px)',
        overflowY: 'auto',
      }}>
        {PALETTE_ELEMENTS.map(({ element, name }) => {
          const isActive = activeElement === element
          const color = getCpkColor(element)
          const valence = getValence(element)

          return (
            <button
              key={element}
              onClick={() => setActiveElement(isActive ? null : element)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '6px',
                border: isActive
                  ? `1px solid ${color}`
                  : '1px solid rgba(255,255,255,0.06)',
                background: isActive
                  ? `${color}18`
                  : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.12s',
              }}
            >
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
                border: isActive ? `2px solid ${color}` : 'none',
              }} />
              <span style={{
                fontSize: '13px',
                fontWeight: 700,
                color: isActive ? color : '#eeeeee',
                width: '18px',
              }}>
                {element}
              </span>
              <span style={{
                fontSize: '10px',
                color: 'var(--text-dim)',
                flex: 1,
              }}>
                {name}
              </span>
              <span style={{
                fontSize: '10px',
                color: 'var(--text-dim)',
                padding: '1px 5px',
                borderRadius: '3px',
                background: 'rgba(255,255,255,0.05)',
              }}>
                {valence}e
              </span>
            </button>
          )
        })}
      </div>

      <div style={{
        marginTop: '10px',
        padding: '6px 8px',
        fontSize: '10px',
        color: 'var(--text-dim)',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '6px',
        textAlign: 'center',
      }}>
        {activeElement
          ? `Click scene to place ${activeElement}`
          : 'Select an element first'}
      </div>
    </div>
  )
}
