import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SceneCanvas } from '../components/simulation/SceneCanvas'
import { rnaWorldScenes } from '../data/scenes/rnaWorld'

export function SimulationPlayerPage() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const navigate = useNavigate()

  const goToScene = useCallback((idx: number) => {
    if (idx < 0 || idx >= rnaWorldScenes.length || transitioning) return
    setTransitioning(true)
    setTimeout(() => {
      setSceneIndex(idx)
      setTransitioning(false)
    }, 300)
  }, [transitioning])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goToScene(sceneIndex - 1)
      if (e.key === 'ArrowRight') goToScene(sceneIndex + 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sceneIndex, goToScene])

  const scene = rnaWorldScenes[sceneIndex]

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#08080e' }}>
      <SceneCanvas key={sceneIndex} scene={scene} />

      <button
        onClick={() => navigate('/biology')}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 50,
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 8,
          padding: '8px 14px',
          color: 'var(--text-dim)',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        ← Back
      </button>

      <div style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 12,
        padding: '10px 24px',
      }}>
        <button
          onClick={() => goToScene(sceneIndex - 1)}
          disabled={sceneIndex === 0}
          style={{
            background: 'none',
            border: 'none',
            color: sceneIndex === 0 ? '#444' : '#eee',
            fontSize: 20,
            cursor: sceneIndex === 0 ? 'default' : 'pointer',
            padding: '4px 8px',
          }}
        >◀</button>
        <div style={{ color: '#999', fontSize: 13, fontWeight: 600, minWidth: 36, textAlign: 'center' }}>
          {sceneIndex + 1} / {rnaWorldScenes.length}
        </div>
        <button
          onClick={() => goToScene(sceneIndex + 1)}
          disabled={sceneIndex === rnaWorldScenes.length - 1}
          style={{
            background: 'none',
            border: 'none',
            color: sceneIndex === rnaWorldScenes.length - 1 ? '#444' : '#eee',
            fontSize: 20,
            cursor: sceneIndex === rnaWorldScenes.length - 1 ? 'default' : 'pointer',
            padding: '4px 8px',
          }}
        >▶</button>
      </div>
    </div>
  )
}
