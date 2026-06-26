import type { MoleculePreset } from '../../data/molecules'
import { ELEMENT_COLORS } from '../../algorithms/moleculeGeometry'

export function MoleculeInfo({ mol }: { mol: MoleculePreset }) {
  const elementCounts: Record<string, number> = {}
  for (const el of mol.elements) {
    elementCounts[el.element] = (elementCounts[el.element] || 0) + 1
  }

  const totalBonds = mol.bonds.reduce((sum, b) => sum + b.type, 0)

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      left: '20px',
      zIndex: 50,
      background: 'var(--card-bg)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--card-border)',
      borderRadius: '10px',
      padding: '16px',
      maxWidth: '240px',
      fontSize: '12px',
      color: 'var(--text-dim)',
      lineHeight: 1.5,
    }}>
      <div style={{
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: 'var(--text-dim)',
        marginBottom: '10px',
        opacity: 0.6,
      }}>
        Info
      </div>

      <div style={{ fontSize: '13px', color: '#eeeeee', fontWeight: 600, marginBottom: '6px' }}>
        {mol.formula}
      </div>
      <div style={{ marginBottom: '10px' }}>
        {mol.description}
      </div>

      <div style={{
        borderTop: '1px solid var(--card-border)',
        paddingTop: '8px',
        marginTop: '4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{ opacity: 0.5 }}>Geometry:</span>
          <span style={{ color: '#cccccc' }}>{mol.geometry}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{ opacity: 0.5 }}>Bonds:</span>
          <span style={{ color: '#cccccc' }}>{totalBonds}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          {Object.entries(elementCounts).map(([el, count]) => (
            <div key={el} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '4px',
              background: `${ELEMENT_COLORS[el] || '#888'}18`,
              border: `1px solid ${ELEMENT_COLORS[el] || '#888'}33`,
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: ELEMENT_COLORS[el] || '#888',
              }} />
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: ELEMENT_COLORS[el] || '#888',
              }}>
                {el}
              </span>
              <span style={{
                fontSize: '10px',
                color: 'var(--text-dim)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                ×{count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
