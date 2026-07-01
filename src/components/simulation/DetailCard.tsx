import { MOLECULE_DETAILS } from '../../data/scenes/moleculeDetails'

export function DetailCard({
  detailKey,
  onClose,
}: {
  detailKey: string | null
  onClose: () => void
}) {
  if (!detailKey) return null

  const info = MOLECULE_DETAILS[detailKey]
  if (!info) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 20,
        width: 280,
        padding: 18,
        borderRadius: 10,
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        backdropFilter: 'blur(8px)',
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'opacity 0.2s, transform 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#eee' }}>{info.name}</div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            fontSize: 16,
            padding: 0,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ fontSize: 12, color: '#4af0ff', marginBottom: 6 }}>{info.formula}</div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>{info.description}</div>
    </div>
  )
}
