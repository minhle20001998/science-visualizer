import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOLECULES } from '../data/molecules'

const ALL_TAGS = ['all', 'simple', 'common', 'organic', 'acid', 'hydrocarbon', 'tetrahedral', 'diatomic', 'triatomic', 'penta', 'hexa', 'alcohol', 'base', 'p-block', 'trigonal-planar', 'aromatic', 'sugar', 'ring', 'fatty-acid', 'ester', 'biological', 'porphyrin']

const TAG_COLORS: Record<string, string> = {
  simple: '#4af0ff',
  common: '#5b8def',
  organic: '#66dd88',
  acid: '#ff6b6b',
  hydrocarbon: '#ffd93d',
  tetrahedral: '#a66cff',
  diatomic: '#4af0ff',
  triatomic: '#5b8def',
  penta: '#ff8000',
  hexa: '#ff6b6b',
  alcohol: '#66dd88',
  base: '#4a9eff',
  'p-block': '#a66cff',
  'trigonal-planar': '#ffd93d',
  aromatic: '#e88dff',
  sugar: '#ff9f6b',
  ring: '#6bcdff',
  'fatty-acid': '#ffb347',
  ester: '#7ec8e3',
  biological: '#e06633',
  porphyrin: '#a66ccd',
}

export function MoleculeHomePage() {
  const [activeTag, setActiveTag] = useState<string>('all')
  const navigate = useNavigate()

  const filtered = activeTag === 'all'
    ? MOLECULES
    : MOLECULES.filter((m) => m.tags.includes(activeTag))

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
        <div style={{ marginBottom: '8px' }}>
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
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#eeeeee', marginBottom: '8px' }}>
            Molecule Visualizer
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Interactive 3D models of molecular structures. Click a molecule to explore.
          </p>
        </div>

        <div style={{
          display: 'flex', gap: '6px', marginBottom: '28px',
          flexWrap: 'wrap',
        }}>
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              style={{
                padding: '5px 12px',
                borderRadius: '16px',
                border: activeTag === tag
                  ? `1px solid ${TAG_COLORS[tag] || '#5b8def'}`
                  : '1px solid rgba(255,255,255,0.08)',
                background: activeTag === tag
                  ? `${TAG_COLORS[tag] || '#5b8def'}18`
                  : 'transparent',
                color: activeTag === tag
                  ? (TAG_COLORS[tag] || '#5b8def')
                  : 'var(--text-dim)',
                fontSize: '11px',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '12px',
        }}>
          {filtered.map((mol) => (
            <div
              key={mol.id}
              onClick={() => navigate(`/molecule/${mol.id}`)}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                padding: '18px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.background = 'rgba(24, 26, 38, 0.92)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.background = 'var(--card-bg)'
              }}
            >
              <div style={{
                fontSize: '22px', fontWeight: 700, color: '#eeeeee',
                fontVariantNumeric: 'tabular-nums', marginBottom: '4px',
              }}>
                {mol.formula}
              </div>
              <div style={{
                fontSize: '12px', color: 'var(--text-dim)', marginBottom: '10px',
              }}>
                {mol.name}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {mol.tags.slice(0, 3).map((tag) => (
                  <span key={tag} style={{
                    fontSize: '9px', padding: '2px 6px', borderRadius: '3px',
                    color: TAG_COLORS[tag] || '#888',
                    background: `${TAG_COLORS[tag] || '#888'}18`,
                    border: `1px solid ${TAG_COLORS[tag] || '#888'}33`,
                    textTransform: 'capitalize',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-dim)', fontSize: '14px' }}>
            No molecules found for this tag.
          </div>
        )}
      </div>
    </div>
  )
}
