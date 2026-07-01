import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SIMULATIONS } from '../data/simulations'

const ALL_TAGS = ['all', 'physics', 'chemistry', 'biology', 'electronics'] as const
const TAG_COLORS: Record<string, string> = {
  physics: '#4af0ff',
  chemistry: '#a66cff',
  biology: '#66dd88',
  electronics: '#ff9900',
}

export function HomePage() {
  const [activeTag, setActiveTag] = useState<string>('all')
  const navigate = useNavigate()

  const filtered = activeTag === 'all'
    ? SIMULATIONS
    : SIMULATIONS.filter((s) => s.tags.includes(activeTag))

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
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#eeeeee',
            marginBottom: '8px',
          }}>
            Visualize Everything
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-dim)',
            lineHeight: 1.5,
          }}>
            Interactive 3D simulations for physics, chemistry, and biology.
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}>
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: activeTag === tag
                  ? `1px solid ${TAG_COLORS[tag] || '#5b8def'}`
                  : '1px solid var(--card-border)',
                background: activeTag === tag
                  ? `${TAG_COLORS[tag] || '#5b8def'}18`
                  : 'var(--card-bg)',
                color: activeTag === tag
                  ? (TAG_COLORS[tag] || '#5b8def')
                  : 'var(--text-dim)',
                fontSize: '12px',
                fontWeight: activeTag === tag ? 600 : 400,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s',
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          {filtered.map((sim) => (
            <div
              key={sim.id}
              onClick={() => navigate(`/${sim.id}`)}
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
              <div style={{
                fontSize: '32px',
                marginBottom: '12px',
              }}>
                {sim.icon}
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#eeeeee',
                marginBottom: '6px',
              }}>
                {sim.title}
              </h3>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-dim)',
                lineHeight: 1.5,
                marginBottom: '14px',
              }}>
                {sim.description}
              </p>
              <div style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
              }}>
                {sim.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '10px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      color: TAG_COLORS[tag] || '#888',
                      background: `${TAG_COLORS[tag] || '#888'}18`,
                      border: `1px solid ${TAG_COLORS[tag] || '#888'}33`,
                      textTransform: 'capitalize',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            color: 'var(--text-dim)',
            fontSize: '14px',
          }}>
            No simulations found for this category yet.
          </div>
        )}
      </div>
    </div>
  )
}
