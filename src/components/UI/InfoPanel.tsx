import { useStore } from '../../store/useStore'

export function InfoPanel() {
  const selectedElectron = useStore((s) => s.selectedElectron)
  const selectElectron = useStore((s) => s.selectElectron)

  if (!selectedElectron) return null

  return (
    <div
      onClick={() => selectElectron(null)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(20, 20, 30, 0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '16px 24px',
          backdropFilter: 'blur(12px)',
          minWidth: '220px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '4px' }}>
          Electron #{selectedElectron.index + 1}
        </div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
          {selectedElectron.label}
        </div>
        <div style={{
          fontSize: '24px',
          color: selectedElectron.spin === '↑' ? '#4af0ff' : '#ff6b6b',
        }}>
          Spin {selectedElectron.spin}
        </div>
        <div
          style={{
            marginTop: '10px',
            fontSize: '11px',
            color: 'var(--text-dim)',
            cursor: 'pointer',
          }}
          onClick={() => selectElectron(null)}
        >
          Click anywhere to close
        </div>
      </div>
    </div>
  )
}
