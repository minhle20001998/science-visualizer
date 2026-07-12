import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Text } from '@react-three/drei'
import * as THREE from 'three'

const DIFFUSE_SPEED = 0.15
const ANIM_WINDOW = 0.65
const CO2_WINDOW = 0.75
const RBC_X = -0.6
const RBC_RADIUS = 0.5
const CELL_X = 3.2
const WALL_X = 0
const MEMBRANE_X = 2.2
const O2_COUNT = 4
const CO2_COUNT = 3
const HB_COUNT = 5

const MITO_POSITIONS: [number, number, number][] = [
  [2.7, 0.15, 0],
  [3.7, -0.15, 0],
]

export type TissuePhase = 'resting' | 'releasing' | 'complete'

function hemeWorldPos(pos: [number, number, number]): THREE.Vector3 {
  return new THREE.Vector3(RBC_X + pos[0], pos[1], pos[2])
}

function makeHbPositions(): [number, number, number][] {
  const pts: [number, number, number][] = []
  for (let i = 0; i < HB_COUNT; i++) {
    const angle = (i / HB_COUNT) * Math.PI * 2 - Math.PI / 2
    pts.push([
      0.35 * Math.cos(angle) * 0.9,
      0.35 * Math.sin(angle) * 0.45,
      (Math.random() - 0.5) * 0.2,
    ])
  }
  return pts
}

function RedBloodCell({ hbPositions, hbRefs }: {
  hbPositions: [number, number, number][]
  hbRefs: React.MutableRefObject<(THREE.Mesh | null)[]>
}) {
  return (
    <group position={[RBC_X, 0, 0]}>
      <mesh>
        <sphereGeometry args={[RBC_RADIUS, 24, 24]} />
        <meshStandardMaterial color="#c04040" roughness={0.3} transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {hbPositions.map((pos, i) => (
        <mesh key={i} position={pos} ref={(el) => { hbRefs.current[i] = el }}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color={i < 4 ? '#44dd66' : '#cc8866'} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function Mito({ pos, label }: { pos: [number, number, number]; label: string }) {
  return (
    <group position={pos}>
      <mesh scale={[0.4, 0.16, 0.16]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#dd8844" roughness={0.5} />
      </mesh>
      <Text position={[0, -0.3, 0]} fontSize={0.09} color="#dd8844" anchorX="center" anchorY="middle" opacity={0.5}>
        {label}
      </Text>
    </group>
  )
}

function CellNucleus() {
  return (
    <group position={[CELL_X, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#aa88cc" roughness={0.4} />
      </mesh>
      <Text position={[0, -0.37, 0]} fontSize={0.1} color="#aa88cc" anchorX="center" anchorY="middle" opacity={0.5}>
        Nucleus
      </Text>
    </group>
  )
}

function OxygenParticles({ phase, progress, hbPositions, hbRefs, boundFlags }: {
  phase: TissuePhase
  progress: React.MutableRefObject<number>
  hbPositions: [number, number, number][]
  hbRefs: React.MutableRefObject<(THREE.Mesh | null)[]>
  boundFlags: React.MutableRefObject<boolean[]>
}) {
  const o2Data = useMemo(() => {
    const data: { targetHbIdx: number; targetMitoIdx: number; delay: number }[] = []
    for (let i = 0; i < O2_COUNT; i++) {
      data.push({ targetHbIdx: i, targetMitoIdx: i % 2, delay: i * 0.07 })
    }
    return data
  }, [])

  const refs = useRef<(THREE.Group | null)[]>([])
  const capturedPos = useRef<THREE.Vector3[]>([])

  useFrame((state) => {
    const p = progress.current
    const t = state.clock.elapsedTime

    o2Data.forEach((o2, i) => {
      const m = refs.current[i]
      if (!m) return

      if (phase === 'complete') { m.visible = false; return }

      const idx = o2.targetHbIdx
      const hp = hbPositions[idx]
      const hemeWp = hemeWorldPos(hp)
      const mitoPos = MITO_POSITIONS[o2.targetMitoIdx]

      if (phase === 'resting') { m.visible = false; return }

      if (p <= o2.delay) { m.visible = false; return }

      if (p >= o2.delay + ANIM_WINDOW) {
        m.visible = false
        return
      }

      const local = (p - o2.delay) / ANIM_WINDOW

      if (local < 0.15) {
        if (!boundFlags.current[idx]) {
          boundFlags.current[idx] = true
          const hb = hbRefs.current[idx]
          if (hb) {
            const mat = hb.material as THREE.MeshStandardMaterial
            mat.color.set('#cc8866')
          }
        }
        m.visible = true
        m.position.copy(hemeWp)
        m.scale.setScalar(1)
      } else if (local < 0.35) {
        m.visible = true
        const ease = ((local - 0.15) / 0.2) * ((local - 0.15) / 0.2) * (3 - 2 * (local - 0.15) / 0.2)
        m.position.set(
          hemeWp.x + (-0.08 - hemeWp.x) * ease,
          hemeWp.y * (1 - ease * 0.5),
          hemeWp.z * (1 - ease * 0.5),
        )
        m.scale.setScalar(1)
      } else if (local < 0.55) {
        m.visible = true
        const ease = ((local - 0.35) / 0.2) * ((local - 0.35) / 0.2) * (3 - 2 * (local - 0.35) / 0.2)
        m.position.set(
          -0.08 + (MEMBRANE_X + 0.2 + 0.08) * ease,
          hemeWp.y * (1 - 0.5) * (1 - ease),
          hemeWp.z * (1 - 0.5) * (1 - ease),
        )
        m.scale.setScalar(1)
      } else if (local < 0.8) {
        m.visible = true
        const ease = ((local - 0.55) / 0.25) * ((local - 0.55) / 0.25) * (3 - 2 * (local - 0.55) / 0.25)
        m.position.set(
          MEMBRANE_X + 0.2 + (mitoPos[0] - MEMBRANE_X - 0.2) * ease,
          mitoPos[1] * ease,
          mitoPos[2] * ease,
        )
        m.scale.setScalar(1 - ease * 0.2)
      } else {
        const ease = ((local - 0.8) / 0.2) * ((local - 0.8) / 0.2) * (3 - 2 * (local - 0.8) / 0.2)
        m.position.set(
          mitoPos[0] + (mitoPos[0] - mitoPos[0]) * ease,
          mitoPos[1] + (mitoPos[1] - mitoPos[1]) * ease,
          mitoPos[2] + (mitoPos[2] - mitoPos[2]) * ease,
        )
        m.scale.setScalar((1 - 0.2) * (1 - ease * 0.8))
        m.visible = ease < 0.95
      }
    })
  })

  return (
    <>
      {o2Data.map((_, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el }}>
          <mesh>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshBasicMaterial color="#00d4ff" transparent opacity={0.8} depthWrite={false} />
          </mesh>
          <Text position={[0, 0.07, 0]} fontSize={0.06} color="#66eeff" anchorX="center" anchorY="bottom" opacity={0.6}>
            O2
          </Text>
        </group>
      ))}
    </>
  )
}

function CO2Particles({ phase, progress, hbPositions, hbRefs, co2BoundFlags }: {
  phase: TissuePhase
  progress: React.MutableRefObject<number>
  hbPositions: [number, number, number][]
  hbRefs: React.MutableRefObject<(THREE.Mesh | null)[]>
  co2BoundFlags: React.MutableRefObject<boolean[]>
}) {
  const co2Data = useMemo(() => {
    const data: { origin: [number, number, number]; targetHbIdx: number; delay: number }[] = [
      { origin: [2.8, 0.25, 0.1], targetHbIdx: 4, delay: 0.03 },
      { origin: [3.5, 0.0, -0.1], targetHbIdx: 0, delay: 0.08 },
      { origin: [3.0, -0.25, 0.05], targetHbIdx: 1, delay: 0.13 },
    ]
    return data
  }, [])

  const refs = useRef<(THREE.Group | null)[]>([])
  const capturedPos = useRef<THREE.Vector3[]>([])

  useFrame((state) => {
    const p = progress.current
    const t = state.clock.elapsedTime

    if (capturedPos.current.length === 0) {
      capturedPos.current = co2Data.map(() => new THREE.Vector3())
    }

    co2Data.forEach((co2, i) => {
      const m = refs.current[i]
      if (!m) return

      const idx = co2.targetHbIdx
      const hp = hbPositions[idx]
      const hemeWp = hemeWorldPos(hp)

      if (phase === 'resting') {
        m.visible = true
        capturedPos.current[i].set(
          co2.origin[0] + Math.sin(t * 0.25 + i * 1.7) * 0.15,
          co2.origin[1] + Math.cos(t * 0.2 + i * 2.3) * 0.1,
          co2.origin[2] + Math.sin(t * 0.15 + i * 1.1) * 0.08,
        )
        m.position.copy(capturedPos.current[i])
        m.scale.setScalar(1)
        return
      }

      if (phase === 'complete') {
        m.visible = true
        m.position.lerp(hemeWp, 0.02)
        m.scale.setScalar(1)
        return
      }

      if (p <= co2.delay) {
        m.visible = true
        m.position.copy(capturedPos.current[i])
        m.scale.setScalar(1)
        return
      }

      if (p >= co2.delay + CO2_WINDOW) {
        m.visible = true
        m.scale.setScalar(1)
        m.position.copy(hemeWp)
        return
      }

      const local = (p - co2.delay) / CO2_WINDOW
      const cp = capturedPos.current[i]

      if (local < 0.2) {
        const ease = (local / 0.2) * (local / 0.2) * (3 - 2 * local / 0.2)
        m.visible = true
        m.position.set(
          cp.x + (MEMBRANE_X - 0.2 - cp.x) * ease,
          cp.y * (1 - ease * 0.3),
          cp.z * (1 - ease * 0.3),
        )
        m.scale.setScalar(1)
      } else if (local < 0.45) {
        const ease = ((local - 0.2) / 0.25) * ((local - 0.2) / 0.25) * (3 - 2 * (local - 0.2) / 0.25)
        m.visible = true
        m.position.set(
          MEMBRANE_X - 0.2 + (WALL_X - MEMBRANE_X + 0.2) * ease,
          0,
          0,
        )
        m.scale.setScalar(1)
      } else if (local < 0.7) {
        const ease = ((local - 0.45) / 0.25) * ((local - 0.45) / 0.25) * (3 - 2 * (local - 0.45) / 0.25)
        m.visible = true
        m.position.set(
          WALL_X + (hemeWp.x - WALL_X) * ease,
          hemeWp.y * ease,
          hemeWp.z * ease,
        )
        m.scale.setScalar(1)
      } else {
        if (!co2BoundFlags.current[idx]) {
          co2BoundFlags.current[idx] = true
          const hb = hbRefs.current[idx]
          if (hb) {
            const mat = hb.material as THREE.MeshStandardMaterial
            mat.color.set('#aa66cc')
          }
        }
        const ease = ((local - 0.7) / 0.3) * ((local - 0.7) / 0.3) * (3 - 2 * (local - 0.7) / 0.3)
        m.visible = true
        m.position.copy(hemeWp)
        m.position.x += (1 - ease) * 0.04
        m.scale.setScalar(1 - ease * 0.3)
      }
    })
  })

  return (
    <>
      {co2Data.map((_, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el }}>
          <mesh>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#ff6666" transparent opacity={0.7} depthWrite={false} />
          </mesh>
          <Text position={[0, 0.1, 0]} fontSize={0.06} color="#ff8888" anchorX="center" anchorY="bottom" opacity={0.6}>
            CO2
          </Text>
        </group>
      ))}
    </>
  )
}

function SceneInner({ phase, onPhaseComplete }: {
  phase: TissuePhase
  onPhaseComplete: () => void
}) {
  const hbPositions = useMemo(() => makeHbPositions(), [])
  const hbRefs = useRef<(THREE.Mesh | null)[]>(Array.from({ length: HB_COUNT }, () => null))
  const progressRef = useRef(0)
  const doneRef = useRef(false)
  const boundFlags = useRef<boolean[]>(Array.from({ length: HB_COUNT }, () => false))
  const co2BoundFlags = useRef<boolean[]>(Array.from({ length: HB_COUNT }, () => false))

  useFrame((_, delta) => {
    if (phase === 'resting') {
      progressRef.current = 0
      doneRef.current = false
      boundFlags.current.fill(false)
      co2BoundFlags.current.fill(false)
      for (let i = 0; i < HB_COUNT; i++) {
        const hb = hbRefs.current[i]
        if (hb) {
          const mat = hb.material as THREE.MeshStandardMaterial
          mat.color.set(i < 4 ? '#44dd66' : '#cc8866')
        }
      }
    }
    if (phase === 'releasing' && !doneRef.current) {
      progressRef.current = Math.min(1, progressRef.current + delta * DIFFUSE_SPEED)
      if (progressRef.current >= 1) {
        doneRef.current = true
        setTimeout(onPhaseComplete, 400)
      }
    }
  })

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={0.6} />
      <directionalLight position={[-2, 1, -3]} intensity={0.25} />

      <mesh position={[-0.6, 0, 0]}>
        <planeGeometry args={[1.4, 3]} />
        <meshBasicMaterial color="#4488ff" transparent opacity={0.03} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[CELL_X, 0, 0]}>
        <circleGeometry args={[0.96, 48]} />
        <meshBasicMaterial color="#d4c8a0" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <mesh position={[WALL_X, 0, 0]}>
        <planeGeometry args={[0.04, 3]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[CELL_X, 0, 0]}>
        <ringGeometry args={[0.96, 1.04, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      <Text position={[-0.6, 1.35, 0]} fontSize={0.14} color="rgba(255,255,255,0.35)" anchorX="center" anchorY="middle">
        Capillary
      </Text>
      <Text position={[0, 1.35, 0]} fontSize={0.1} color="rgba(255,255,255,0.25)" anchorX="center" anchorY="middle">
        Capillary Wall
      </Text>
      <Text position={[1.1, 1.35, 0]} fontSize={0.12} color="rgba(255,255,255,0.25)" anchorX="center" anchorY="middle">
        Interstitial Fluid
      </Text>
      <Text position={[CELL_X, -1.15, 0]} fontSize={0.1} color="rgba(255,255,255,0.25)" anchorX="center" anchorY="middle">
        Cell Membrane
      </Text>
      <Text position={[CELL_X, 1.3, 0]} fontSize={0.14} color="rgba(255,255,255,0.35)" anchorX="center" anchorY="middle">
        Body Cell
      </Text>

      <RedBloodCell hbPositions={hbPositions} hbRefs={hbRefs} />
      <CellNucleus />
      <Mito pos={MITO_POSITIONS[0]} label="Mitochondria" />
      <Mito pos={MITO_POSITIONS[1]} label="Mitochondria" />
      <OxygenParticles phase={phase} progress={progressRef} hbPositions={hbPositions} hbRefs={hbRefs} boundFlags={boundFlags} />
      <CO2Particles phase={phase} progress={progressRef} hbPositions={hbPositions} hbRefs={hbRefs} co2BoundFlags={co2BoundFlags} />
    </>
  )
}

export function TissueDeliveryScene({ phase, onRelease, onPhaseComplete, onReset }: {
  phase: TissuePhase
  onRelease: () => void
  onPhaseComplete: () => void
  onReset: () => void
}) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[1.5, 0, 4.8]} fov={40} />
        <SceneInner phase={phase} onPhaseComplete={onPhaseComplete} />
      </Canvas>

      {phase !== 'releasing' && (
        <div style={{
          position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, textAlign: 'center',
        }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#eeeeee', margin: 0, marginBottom: 6, letterSpacing: 2 }}>
            Oxygen in Blood
          </h1>
          <div style={{ maxWidth: 520 }}>
            {phase === 'resting' && (
              <>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, marginBottom: 6, lineHeight: 1.6 }}>
                  Red blood cells carry oxygen bound to hemoglobin through arteries to capillaries
                  surrounding every organ. In tissues, cellular respiration consumes O₂, creating a
                  low-oxygen environment that triggers hemoglobin to release its cargo.
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0, marginBottom: 24, lineHeight: 1.5 }}>
                  Press <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Release</strong> to watch O₂ unbind from hemoglobin and diffuse into the body cell.
                </p>
              </>
            )}
            {phase === 'complete' && (
              <>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, marginBottom: 6, lineHeight: 1.6 }}>
                  O₂ reaches the mitochondria, where it serves as the final electron acceptor in the
                  electron transport chain — driving ATP synthesis that powers every cellular function.
                  CO₂ produced during the Krebs cycle diffuses back into the blood for removal.
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0, marginBottom: 24, lineHeight: 1.5 }}>
                  The oxygen cascade is complete: lungs → blood → tissues.
                </p>
              </>
            )}
          </div>
          {phase === 'resting' && (
            <button onClick={onRelease} style={btnStyle}>Release</button>
          )}
          {phase === 'complete' && (
            <button onClick={onReset} style={{ ...btnStyle, borderColor: 'rgba(255,255,255,0.3)', color: '#aaa' }}>Reset</button>
          )}
        </div>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: 'rgba(0, 212, 255, 0.15)',
  border: '1px solid rgba(0, 212, 255, 0.4)',
  borderRadius: 10,
  padding: '10px 28px',
  color: '#00d4ff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  letterSpacing: '0.5px',
  backdropFilter: 'blur(4px)',
}
