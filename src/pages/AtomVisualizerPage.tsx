import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useNavigate } from 'react-router-dom'
import { Atom } from '../components/Atom'
import { AxisIndicator } from '../components/AxisIndicator'
import { OrbitalList } from '../components/UI/OrbitalList'
import { SpeedSlider } from '../components/UI/SpeedSlider'
import { ElementInput } from '../components/UI/ElementInput'
import { InfoPanel } from '../components/UI/InfoPanel'
import { useStore } from '../store/useStore'
import { getElectronConfig } from '../algorithms/electronConfig'

function Scene() {
  const atomicNumber = useStore((s) => s.atomicNumber)
  const autoRotate = useStore((s) => s.autoRotate)
  const showOrbitals = useStore((s) => s.showOrbitals)

  const camPos = useMemo(() => {
    const config = getElectronConfig(atomicNumber)
    const maxN = Math.max(...config.map((c) => c.n))
    const maxRadius = maxN * 4.5 + 1.5 * (maxN - 1)
    const d = Math.max(35, maxRadius * 2)
    return [d, d * 0.6, d] as [number, number, number]
  }, [atomicNumber])

  return (
    <>
      <PerspectiveCamera makeDefault position={camPos} fov={40} />
      <color attach="background" args={['#08080e']} />
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#4af0ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#ff6b6b" />
      <directionalLight position={[0, 5, 10]} intensity={0.3} />
      <Atom atomicNumber={atomicNumber} />
      <AxisIndicator visible={showOrbitals} />
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={300}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        enableDamping
        dampingFactor={0.1}
      />
      <EffectComposer>
        <Bloom intensity={0.4} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </>
  )
}

export function AtomVisualizerPage() {
  const navigate = useNavigate()

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#08080e' }}>
      <Canvas gl={{ antialias: true, alpha: false }} style={{ width: '100%', height: '100%' }}>
        <Scene />
      </Canvas>

      <div style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            padding: '6px 14px',
            color: 'var(--text-dim)',
            fontSize: '12px',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#eeeeee'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
        >
          ← Back
        </button>
      </div>

      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
        background: 'var(--card-bg)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--card-border)',
        borderRadius: '12px',
        padding: '10px 20px',
        zIndex: 50,
      }}>
        <ElementInput />
        <div style={{ width: '1px', height: '44px', background: 'var(--card-border)' }} />
        <SpeedSlider />
        <label style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '11px', color: 'var(--text-dim)', cursor: 'pointer',
          whiteSpace: 'nowrap', userSelect: 'none',
        }}>
          <input type="checkbox" checked={useStore((s) => s.autoRotate)}
            onChange={() => useStore.getState().toggleAutoRotate()}
            style={{ accentColor: 'var(--accent)', cursor: 'pointer' }} />
          Rotate
        </label>
        <label style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '11px', color: 'var(--text-dim)', cursor: 'pointer',
          whiteSpace: 'nowrap', userSelect: 'none',
        }}>
          <input type="checkbox" checked={useStore((s) => s.showOrbitals)}
            onChange={() => useStore.getState().toggleOrbitals()}
            style={{ accentColor: 'var(--accent)', cursor: 'pointer' }} />
          Shells
        </label>
      </div>

      <OrbitalList />
      <InfoPanel />
    </div>
  )
}
