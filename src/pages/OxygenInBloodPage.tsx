import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HumanBodyScene } from '../components/oxygen/HumanBodyScene'
import { AlveolusScene } from '../components/oxygen/AlveolusScene'
import type { AlveolusPhase } from '../components/oxygen/AlveolusScene'
import { CrossSectionScene } from '../components/oxygen/CrossSectionScene'
import type { CrossSectionPhase } from '../components/oxygen/CrossSectionScene'
import { TissueDeliveryScene } from '../components/oxygen/TissueDeliveryScene'
import type { TissuePhase } from '../components/oxygen/TissueDeliveryScene'

const TOTAL_SCENES = 4

export function OxygenInBloodPage() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [alveolusPhase, setAlveolusPhase] = useState<AlveolusPhase>('resting')
  const [crossPhase, setCrossPhase] = useState<CrossSectionPhase>('resting')
  const [tissuePhase, setTissuePhase] = useState<TissuePhase>('resting')
  const navigate = useNavigate()

  const goToScene = (idx: number) => {
    setSceneIndex(idx)
    setAlveolusPhase('resting')
    setCrossPhase('resting')
    setTissuePhase('resting')
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#08080e' }}>
      {sceneIndex === 0 && (
        <HumanBodyScene onInhale={() => goToScene(1)} />
      )}
      {sceneIndex === 1 && (
        <AlveolusScene
          phase={alveolusPhase}
          onInhale={() => setAlveolusPhase('inhaling')}
          onDiffuse={() => setAlveolusPhase('diffusing')}
          onPhaseComplete={(p) => {
            setAlveolusPhase(p)
            if (p === 'complete') goToScene(2)
          }}
        />
      )}
      {sceneIndex === 2 && (
        <CrossSectionScene
          phase={crossPhase}
          onDiffuse={() => setCrossPhase('diffusing')}
          onPhaseComplete={() => {
            setCrossPhase('complete')
            setTimeout(() => goToScene(3), 2000)
          }}
          onReset={() => setCrossPhase('resting')}
        />
      )}
      {sceneIndex === 3 && (
        <TissueDeliveryScene
          phase={tissuePhase}
          onRelease={() => setTissuePhase('releasing')}
          onPhaseComplete={() => setTissuePhase('complete')}
          onReset={() => setTissuePhase('resting')}
        />
      )}

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
          {sceneIndex + 1} / {TOTAL_SCENES}
        </div>
        <button
          onClick={() => goToScene(sceneIndex + 1)}
          disabled={sceneIndex === TOTAL_SCENES - 1}
          style={{
            background: 'none',
            border: 'none',
            color: sceneIndex === TOTAL_SCENES - 1 ? '#444' : '#eee',
            fontSize: 20,
            cursor: sceneIndex === TOTAL_SCENES - 1 ? 'default' : 'pointer',
            padding: '4px 8px',
          }}
        >▶</button>
      </div>
    </div>
  )
}
