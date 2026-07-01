import { useNavigate } from 'react-router-dom'

export function SimulationListPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08080e',
      color: 'var(--text)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        maxWidth: '1100px',
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

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#eeeeee', marginBottom: '8px' }}>
            Life Simulation
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Interactive 3D origins-of-life simulations.
          </p>
        </div>

        <div
          onClick={() => navigate('/biology/rna')}
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
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧬</div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#eeeeee', marginBottom: '6px' }}>
            RNA World
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Explore the primordial soup, phosphodiester bonds, and RNA folding in 3D.
          </p>
        </div>
      </div>
    </div>
  )
}
