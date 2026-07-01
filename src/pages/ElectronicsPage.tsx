import { useNavigate } from 'react-router-dom'

interface ESim {
  id: string
  title: string
  description: string
  icon: string
}

const EMS: ESim[] = [
  {
    id: 'nmos',
    title: 'NMOS Transistor',
    description: 'Interactive 3D cross-section of a MOSFET. Toggle the gate voltage to see the channel form and electrons flow from source to drain.',
    icon: '🔲',
  },
]

export function ElectronicsPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08080e',
      color: 'var(--text)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '60px 24px',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            fontSize: '12px',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '16px',
          }}
        >
          ← Back to Home
        </button>

        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔌</div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#eeeeee', marginBottom: '8px' }}>
            Electronics
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            How electricity flows through human-made components — transistors, circuits, and beyond.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          {EMS.map((sim) => (
            <div
              key={sim.id}
              onClick={() => navigate(`/electronics/${sim.id}`)}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.background = 'rgba(24, 26, 38, 0.92)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.background = 'var(--card-bg)'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                {sim.icon}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#eeeeee', marginBottom: '6px' }}>
                {sim.title}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                {sim.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
