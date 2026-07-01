import { useState, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { SceneOrb } from './SceneOrb'
import { FloatingLabel } from './FloatingLabel'
import { FloatingBondStick } from './FloatingBondStick'
import { DetailCard } from './DetailCard'
import { BondAnimation } from './BondAnimation'
import { ReplicationAnimation } from './ReplicationAnimation'
import { EncapsulationAnimation } from './EncapsulationAnimation'
import { PhosphodiesterBond } from './PhosphodiesterBond'
import { MOLECULE_DETAILS } from '../../data/scenes/moleculeDetails'
import type { SceneData, SceneOrb as SceneOrbData, SceneBond } from '../../data/scenes/rnaWorld'

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function lerpV3(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ]
}

function SceneInner({
  orbs,
  bonds,
  isSoup,
  onOrbClick,
}: {
  orbs: SceneOrbData[]
  bonds: SceneBond[]
  isSoup: boolean
  onOrbClick: (key: string) => void
}) {
  const [positions, setPositions] = useState(
    orbs.map(o => [...o.position] as [number, number, number])
  )
  const prevOrbsRef = useRef(orbs)
  const fromRef = useRef(positions)
  const progressRef = useRef(1)

  useFrame((_, delta) => {
    if (orbs !== prevOrbsRef.current) {
      fromRef.current = positions
      prevOrbsRef.current = orbs
      progressRef.current = 0
    }

    if (progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + delta * 2)
      const t = easeInOutCubic(progressRef.current)
      setPositions(
        orbs.map((orb, i) =>
          lerpV3(
            fromRef.current[i] ?? orb.position,
            orb.position,
            t
          )
        )
      )
    }
  })

  return (
    <>
      {orbs.map((orb, i) => (
        <SceneOrb
          key={i}
          element={orb.element}
          detailKey={orb.detailKey}
          position={positions[i]}
          drifting={isSoup}
          onClick={(key) => onOrbClick(key)}
        />
      ))}
      {bonds
        .filter(b => !b.animated)
        .map((bond, i) => (
          <PhosphodiesterBond
            key={i}
            start={positions[bond.from]}
            end={positions[bond.to]}
            type={(bond.type === 3 ? 1 : bond.type) as 1 | 2}
          />
        ))}
    </>
  )
}

export function SceneCanvas({ scene }: { scene: SceneData }) {
  const [selectedDetailKey, setSelectedDetailKey] = useState<string | null>(null)
  const [animating, setAnimating] = useState<'none' | 'backbone' | 'bases'>('none')
  const [backboneDone, setBackboneDone] = useState(false)
  const [basesDone, setBasesDone] = useState(false)
  const [variantIndex, setVariantIndex] = useState<number | null>(null)
  const [repPhase, setRepPhase] = useState<0 | 1 | 2 | 3 | 4>(0)
  const [repPhase1Done, setRepPhase1Done] = useState(false)
  const [repPhase2Done, setRepPhase2Done] = useState(false)
  const [repPhase3Done, setRepPhase3Done] = useState(false)
  const [repPhase4Done, setRepPhase4Done] = useState(false)
  const [encapsulating, setEncapsulating] = useState(false)
  const [encapsDone, setEncapsDone] = useState(false)
  const [showWater, setShowWater] = useState(true)

  const isPhosphodiester = scene.id === 'phosphodiester'
  const isReplication = scene.id === 'replication'
  const isProtocell = scene.id === 'protocell'
  const hasVariants = !!scene.variants && scene.variants.length > 0
  const activeVariant = hasVariants && variantIndex !== null ? scene.variants![variantIndex] : null

  const activeTitle = activeVariant ? activeVariant.title : scene.title
  const activeDescription = activeVariant ? activeVariant.description : scene.description
  const activeOrbs = activeVariant ? activeVariant.orbs : scene.orbs
  const activeBonds = activeVariant ? activeVariant.bonds : scene.bonds
  const activeLabels = activeVariant ? activeVariant.labels : scene.labels

  const center = useMemo(() => {
    const n = scene.orbs.length
    if (n === 0) return [0, 0, 0] as [number, number, number]
    return [
      scene.orbs.reduce((s, o) => s + o.position[0], 0) / n,
      scene.orbs.reduce((s, o) => s + o.position[1], 0) / n,
      scene.orbs.reduce((s, o) => s + o.position[2], 0) / n,
    ] as [number, number, number]
  }, [scene.id])

  const toggleVariant = () => {
    if (!scene.variants) return
    if (variantIndex === null) {
      setVariantIndex(0)
    } else if (variantIndex < scene.variants.length - 1) {
      setVariantIndex(variantIndex + 1)
    } else {
      setVariantIndex(null)
    }
  }

  const handleBackbone = () => setAnimating('backbone')
  const handleBases = () => setAnimating('bases')
  const handleBackboneComplete = () => { setBackboneDone(true); setAnimating('none') }
  const handleBasesComplete = () => { setBasesDone(true); setAnimating('none') }

  const handleRepPhase1 = () => {
    if (repPhase1Done) {
      setRepPhase1Done(false)
      setRepPhase2Done(false)
      setRepPhase3Done(false)
      setRepPhase4Done(false)
    } else {
      setRepPhase(1)
    }
  }
  const handleRepPhase2 = () => {
    if (repPhase2Done) {
      setRepPhase2Done(false)
      setRepPhase3Done(false)
      setRepPhase4Done(false)
    } else {
      setRepPhase(2)
    }
  }
  const handleRepPhase3 = () => {
    if (repPhase3Done) {
      setRepPhase3Done(false)
      setRepPhase4Done(false)
    } else {
      setRepPhase(3)
    }
  }
  const handleRepPhase4 = () => {
    if (repPhase4Done) {
      setRepPhase4Done(false)
    } else {
      setRepPhase(4)
    }
  }
  const handleRepP1Done = () => { setRepPhase1Done(true); setRepPhase(0) }
  const handleRepP2Done = () => { setRepPhase2Done(true); setRepPhase(0) }
  const handleRepP3Done = () => { setRepPhase3Done(true); setRepPhase(0) }
  const handleRepP4Done = () => { setRepPhase4Done(true); setRepPhase(0) }
  const handleEncapsulate = () => { setEncapsulating(true) }
  const handleEncapsDone = () => { setEncapsulating(false); setEncapsDone(true) }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas onPointerMissed={() => setSelectedDetailKey(null)}>
        <color attach="background" args={['#08080e']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <PerspectiveCamera
          makeDefault
          position={[center[0], center[1], 12]}
          fov={40}
        />

        {isPhosphodiester ? (
          <BondAnimation
            scene={scene}
            animating={animating}
            backboneDone={backboneDone}
            basesDone={basesDone}
            onBackboneComplete={handleBackboneComplete}
            onBasesComplete={handleBasesComplete}
            onOrbClick={setSelectedDetailKey}
          />
        ) : isReplication ? (
          <ReplicationAnimation
            scene={scene}
            phase={repPhase}
            phase1Done={repPhase1Done}
            phase2Done={repPhase2Done}
            phase3Done={repPhase3Done}
            phase4Done={repPhase4Done}
            onPhase1Complete={handleRepP1Done}
            onPhase2Complete={handleRepP2Done}
            onPhase3Complete={handleRepP3Done}
            onPhase4Complete={handleRepP4Done}
            onOrbClick={setSelectedDetailKey}
          />
        ) : isProtocell ? (
          <EncapsulationAnimation
            scene={scene}
            encapsulating={encapsulating}
            encapsDone={encapsDone}
            showWater={showWater}
            onEncapsComplete={handleEncapsDone}
            onOrbClick={setSelectedDetailKey}
          />
        ) : (
          <SceneInner
            orbs={activeOrbs}
            bonds={activeBonds}
            isSoup={scene.id === 'soup'}
            onOrbClick={setSelectedDetailKey}
          />
        )}

        {activeLabels.map((label, i) => (
          <FloatingLabel
            key={i}
            text={label.text}
            position={label.position}
            detailKey={label.detailKey}
            onClick={label.detailKey ? (key) => setSelectedDetailKey(key) : undefined}
          />
        ))}
        {scene.floatingBonds.map((fb, i) => (
          <FloatingBondStick
            key={i}
            position={fb.position}
            detailKey={fb.detailKey}
            drifting={scene.id === 'soup'}
            onClick={(key) => setSelectedDetailKey(key)}
          />
        ))}
        {activeOrbs.length > 0 && (
          <OrbitControls enablePan minDistance={3} maxDistance={25} target={center} />
        )}
      </Canvas>

      <div style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#eee', marginBottom: 4 }}>
          {activeTitle}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          {activeDescription}
        </div>
      </div>

      {(() => {
        const defs = activeLabels
          .filter(l => l.detailKey && MOLECULE_DETAILS[l.detailKey])
          .map(l => ({ label: l.text, detail: MOLECULE_DETAILS[l.detailKey!] }))
        if (defs.length === 0) return null
        return (
          <div style={{
            position: 'fixed',
            top: 68,
            left: 20,
            zIndex: 50,
            width: 220,
            maxHeight: 280,
            overflowY: 'auto',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 10,
            padding: '12px 14px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#aaa', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
              Labels
            </div>
            {defs.map(({ label, detail }, i) => (
              <div key={i} style={{ marginBottom: i < defs.length - 1 ? 14 : 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#eee', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, color: '#ccc', lineHeight: 1.5 }}>{detail.description}</div>
              </div>
            ))}
          </div>
        )
      })()}

      {hasVariants && (
        <div style={{
          position: 'fixed',
          bottom: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}>
          <button
            onClick={toggleVariant}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              color: '#eee',
              background: '#2a4a6a',
              border: '1px solid #4a8abc',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            {variantIndex === null ? '⚡ Fold RNA' : '↩ Unfold'}
          </button>
        </div>
      )}

      {isReplication && (
        <div style={{
          position: 'fixed',
          bottom: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: 12,
        }}>
          <button
            onClick={handleRepPhase1}
            disabled={repPhase !== 0}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              color: repPhase1Done ? '#88ddff' : repPhase === 1 ? '#eee' : '#eee',
              background: repPhase1Done ? '#1a2a3a' : repPhase === 1 ? '#444' : '#2a4a6a',
              border: repPhase1Done ? '1px solid #88ddff' : '1px solid #4a8abc',
              borderRadius: 8,
              cursor: repPhase !== 0 ? 'default' : 'pointer',
            }}
          >
            {repPhase1Done ? 'Docked ✓' : repPhase === 1 ? 'Docking...' : '⚡ Dock NTPs'}
          </button>
          <button
            onClick={handleRepPhase2}
            disabled={repPhase !== 0 || !repPhase1Done}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              color: repPhase2Done ? '#88ddff' : !repPhase1Done ? '#555' : repPhase === 2 ? '#eee' : '#eee',
              background: repPhase2Done ? '#1a2a3a' : !repPhase1Done ? '#1a1a1a' : repPhase === 2 ? '#444' : '#2a4a6a',
              border: repPhase2Done ? '1px solid #88ddff' : !repPhase1Done ? '1px solid #222' : '1px solid #4a8abc',
              borderRadius: 8,
              cursor: (repPhase !== 0 || !repPhase1Done) ? 'default' : 'pointer',
            }}
          >
            {repPhase2Done ? 'Separated' : repPhase === 2 ? 'Separating...' : '⚡ Separate'}
          </button>
          <button
            onClick={handleRepPhase3}
            disabled={repPhase !== 0 || !repPhase2Done}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              color: repPhase3Done ? '#88ddff' : !repPhase2Done ? '#555' : repPhase === 3 ? '#eee' : '#eee',
              background: repPhase3Done ? '#1a2a3a' : !repPhase2Done ? '#1a1a1a' : repPhase === 3 ? '#444' : '#2a4a6a',
              border: repPhase3Done ? '1px solid #88ddff' : !repPhase2Done ? '1px solid #222' : '1px solid #4a8abc',
              borderRadius: 8,
              cursor: (repPhase !== 0 || !repPhase2Done) ? 'default' : 'pointer',
            }}
          >
            {repPhase3Done ? 'Replicated ✓' : repPhase === 3 ? 'Replicating...' : '⚡ Replicate Copy'}
          </button>
          <button
            onClick={handleRepPhase4}
            disabled={repPhase !== 0 || !repPhase3Done}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              color: repPhase4Done ? '#88ddff' : !repPhase3Done ? '#555' : repPhase === 4 ? '#eee' : '#eee',
              background: repPhase4Done ? '#1a2a3a' : !repPhase3Done ? '#1a1a1a' : repPhase === 4 ? '#444' : '#2a4a6a',
              border: repPhase4Done ? '1px solid #88ddff' : !repPhase3Done ? '1px solid #222' : '1px solid #4a8abc',
              borderRadius: 8,
              cursor: (repPhase !== 0 || !repPhase3Done) ? 'default' : 'pointer',
            }}
          >
            {repPhase4Done ? 'Separated' : repPhase === 4 ? 'Separating...' : '⚡ Separate Copy'}
          </button>
        </div>
      )}

      {isProtocell && (
        <div style={{
          position: 'fixed',
          bottom: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: 12,
        }}>
          <button
            onClick={() => setShowWater(s => !s)}
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 600,
              color: showWater ? '#88ddff' : '#888',
              background: showWater ? '#1a2a3a' : '#1a1a1a',
              border: showWater ? '1px solid #88ddff' : '1px solid #444',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            {showWater ? '💧 On' : '💧 Off'}
          </button>
          <button
            onClick={handleEncapsulate}
            disabled={encapsulating || encapsDone}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              color: encapsDone ? '#88ddff' : encapsulating ? '#eee' : '#eee',
              background: encapsDone ? '#1a2a3a' : encapsulating ? '#444' : '#2a4a6a',
              border: encapsDone ? '1px solid #88ddff' : '1px solid #4a8abc',
              borderRadius: 8,
              cursor: (encapsulating || encapsDone) ? 'default' : 'pointer',
            }}
          >
            {encapsDone ? 'Encapsulated ✓' : encapsulating ? 'Encapsulating...' : '⚡ Encapsulate'}
          </button>
        </div>
      )}

      {isPhosphodiester && (
        <div style={{
          position: 'fixed',
          bottom: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: 12,
        }}>
          <button
            onClick={handleBackbone}
            disabled={animating !== 'none' || backboneDone}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              color: backboneDone ? '#666' : '#eee',
              background: backboneDone ? '#222' : animating === 'backbone' ? '#444' : '#2a4a6a',
              border: backboneDone ? '1px solid #333' : '1px solid #4a8abc',
              borderRadius: 8,
              cursor: (animating !== 'none' || backboneDone) ? 'default' : 'pointer',
            }}
          >
            {backboneDone ? '✓ Backbone Formed' : animating === 'backbone' ? 'Forming Backbone...' : '⚡ Form Backbone'}
          </button>
          <button
            onClick={handleBases}
            disabled={animating !== 'none' || !backboneDone || basesDone}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              color: basesDone ? '#666' : !backboneDone ? '#555' : '#eee',
              background: basesDone ? '#222' : !backboneDone ? '#1a1a1a' : animating === 'bases' ? '#444' : '#2a4a6a',
              border: basesDone ? '1px solid #333' : !backboneDone ? '1px solid #222' : '1px solid #4a8abc',
              borderRadius: 8,
              cursor: (animating !== 'none' || !backboneDone || basesDone) ? 'default' : 'pointer',
            }}
          >
            {basesDone ? '✓ Bases Attached' : animating === 'bases' ? 'Attaching Bases...' : '⚡ Attach Bases'}
          </button>
        </div>
      )}

      <DetailCard
        detailKey={selectedDetailKey}
        onClose={() => setSelectedDetailKey(null)}
      />
    </div>
  )
}