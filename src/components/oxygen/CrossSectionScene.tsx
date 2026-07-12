import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Text } from '@react-three/drei'
import * as THREE from 'three'

const DIFFUSE_SPEED = 0.15
const ANIM_WINDOW = 0.6
const CO2_WINDOW = 0.55
const RBC_X = 1.1
const RBC_RADIUS = 0.5
const O2_COUNT = 4
const CO2_COUNT = 3
const HB_COUNT = 5

function hemeTarget(pos: [number, number, number]): THREE.Vector3 {
  return new THREE.Vector3(RBC_X + pos[0], pos[1], pos[2])
}

export type CrossSectionPhase = 'resting' | 'diffusing' | 'complete'

function RedBloodCell({ hbPositions, hemeRefs }: {
  hbPositions: [number, number, number][]
  hemeRefs: React.MutableRefObject<(THREE.Mesh | null)[]>
}) {
  return (
    <group position={[RBC_X, 0, 0]}>
      <mesh>
        <sphereGeometry args={[RBC_RADIUS, 24, 24]} />
        <meshStandardMaterial
          color="#c04040"
          roughness={0.3}
          transparent
          opacity={0.3}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {hbPositions.map((pos, i) => (
        <mesh key={i} position={pos} ref={(el) => { hemeRefs.current[i] = el }}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#cc8866" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function OxygenParticles({ phase, progress, hbPositions, hemeRefs, boundFlags }: {
  phase: CrossSectionPhase
  progress: React.MutableRefObject<number>
  hbPositions: [number, number, number][]
  hemeRefs: React.MutableRefObject<(THREE.Mesh | null)[]>
  boundFlags: React.MutableRefObject<boolean[]>
}) {
  const o2Data = useMemo(() => {
    const data: { targetHbIdx: number; delay: number }[] = []
    for (let i = 0; i < O2_COUNT; i++) {
      data.push({ targetHbIdx: i, delay: i * 0.06 })
    }
    return data
  }, [])

  const refs = useRef<(THREE.Group | null)[]>([])
  const driftOrigin = useRef<THREE.Vector3[]>([])
  const capturedPos = useRef<THREE.Vector3[]>([])
  if (driftOrigin.current.length === 0) {
    for (let i = 0; i < O2_COUNT; i++) {
      driftOrigin.current.push(new THREE.Vector3(
        -0.85 - Math.random() * 0.35,
        (Math.random() - 0.5) * 0.7,
        (Math.random() - 0.5) * 0.4,
      ))
      capturedPos.current.push(new THREE.Vector3())
    }
  }

  useFrame((state) => {
    const p = progress.current
    const t = state.clock.elapsedTime

    o2Data.forEach((o2, i) => {
      const m = refs.current[i]
      if (!m) return

      if (phase === 'resting') {
        m.visible = true
        capturedPos.current[i].set(
          driftOrigin.current[i].x + Math.sin(t * 0.3 + i * 1.5) * 0.15,
          driftOrigin.current[i].y + Math.cos(t * 0.25 + i * 2.0) * 0.12,
          driftOrigin.current[i].z + Math.sin(t * 0.2 + i * 1.2) * 0.08,
        )
        m.position.copy(capturedPos.current[i])
        m.scale.setScalar(1)
        return
      }

      if (phase === 'complete') {
        m.visible = false
        return
      }

      const idx = o2.targetHbIdx
      const cp = capturedPos.current[i]

      if (p <= o2.delay) {
        m.visible = true
        m.position.copy(cp)
        m.scale.setScalar(1)
        return
      }
      if (p >= o2.delay + ANIM_WINDOW) {
        if (!boundFlags.current[idx]) {
          boundFlags.current[idx] = true
          const heme = hemeRefs.current[idx]
          if (heme) {
            const mat = heme.material as THREE.MeshStandardMaterial
            mat.color.set('#44dd66')
          }
        }
        m.visible = false
        return
      }

      const local = (p - o2.delay) / ANIM_WINDOW
      const hbPos = hbPositions[idx]
      const target = hemeTarget(hbPos)

      if (local < 0.3) {
        m.visible = true
        const ease = local / 0.3
        const s = ease * ease * (3 - 2 * ease)
        m.position.set(
          cp.x + (0.05 - cp.x) * s,
          cp.y * (1 - s * 0.4),
          cp.z * (1 - s * 0.4),
        )
        m.scale.setScalar(1)
      } else if (local < 0.55) {
        m.visible = true
        const ease = ((local - 0.3) / 0.25) * ((local - 0.3) / 0.25) * (3 - 2 * (local - 0.3) / 0.25)
        m.position.set(
          0.05 + (RBC_X - RBC_RADIUS * 0.7 - 0.05) * ease,
          cp.y * (1 - 0.4 - 0.6 * ease),
          cp.z * (1 - 0.4 - 0.6 * ease),
        )
        m.scale.setScalar(1)
      } else if (local < 0.8) {
        m.visible = true
        const ease = ((local - 0.55) / 0.25) * ((local - 0.55) / 0.25) * (3 - 2 * (local - 0.55) / 0.25)
        const entryX = RBC_X - RBC_RADIUS * 0.7
        m.position.set(
          entryX + (target.x - entryX) * ease,
          (cp.y * (1 - 0.4 - 0.6) + (target.y - cp.y * (1 - 0.4 - 0.6)) * ease),
          (cp.z * (1 - 0.4 - 0.6) + (target.z - cp.z * (1 - 0.4 - 0.6)) * ease),
        )
        m.scale.setScalar(1 - ease * 0.3)
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

function CO2Particles({ phase, progress }: {
  phase: CrossSectionPhase
  progress: React.MutableRefObject<number>
}) {
  const co2Data = useMemo(() => {
    const data: { startPos: [number, number, number]; delay: number }[] = []
    for (let i = 0; i < CO2_COUNT; i++) {
      data.push({
        startPos: [
          RBC_X + (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
        ],
        delay: 0.04 + i * 0.06,
      })
    }
    return data
  }, [])

  const refs = useRef<(THREE.Group | null)[]>([])

  useFrame(() => {
    const p = progress.current

    co2Data.forEach((co2, i) => {
      const m = refs.current[i]
      if (!m) return

      if (phase !== 'diffusing') {
        m.visible = false
        return
      }

      if (p <= co2.delay || p >= co2.delay + CO2_WINDOW) {
        m.visible = p >= co2.delay + CO2_WINDOW
        return
      }

      const local = (p - co2.delay) / CO2_WINDOW
      m.visible = true

      if (local < 0.25) {
        const ease = (local / 0.25) * (local / 0.25) * (3 - 2 * local / 0.25)
        m.position.set(
          co2.startPos[0] + (0.3 - co2.startPos[0]) * ease,
          co2.startPos[1] * (1 - ease * 0.3),
          co2.startPos[2] * (1 - ease * 0.3),
        )
        m.scale.setScalar(1)
      } else if (local < 0.55) {
        const ease = ((local - 0.25) / 0.3) * ((local - 0.25) / 0.3) * (3 - 2 * (local - 0.25) / 0.3)
        m.position.set(
          0.3 + (-0.08 - 0.3) * ease,
          co2.startPos[1] * (1 - 0.3 - 0.7 * ease),
          co2.startPos[2] * (1 - 0.3 - 0.7 * ease),
        )
        m.scale.setScalar(1)
      } else {
        const ease = ((local - 0.55) / 0.45) * ((local - 0.55) / 0.45) * (3 - 2 * (local - 0.55) / 0.45)
        m.position.set(
          -0.08 + (-0.85 - (-0.08)) * ease,
          co2.startPos[1] * (1 - 0.3 - 0.7 + ease * 0.3),
          co2.startPos[2] * (1 - 0.3 - 0.7 + ease * 0.3),
        )
        m.scale.setScalar(1 + ease * 0.5)
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
  phase: CrossSectionPhase
  onPhaseComplete: () => void
}) {
  const hbPositions = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i < HB_COUNT; i++) {
      const angle = (i / HB_COUNT) * Math.PI * 2 - Math.PI / 2
      const r = 0.35
      pts.push([
        r * Math.cos(angle) * 0.9,
        r * Math.sin(angle) * 0.45,
        (Math.random() - 0.5) * 0.2,
      ])
    }
    return pts
  }, [])

  const hemeRefs = useRef<(THREE.Mesh | null)[]>(Array.from({ length: HB_COUNT }, () => null))
  const progressRef = useRef(0)
  const doneRef = useRef(false)
  const boundFlags = useRef<boolean[]>(Array.from({ length: HB_COUNT }, () => false))

  useFrame((_, delta) => {
    if (phase === 'resting') {
      progressRef.current = 0
      doneRef.current = false
      boundFlags.current.fill(false)
      for (let i = 0; i < HB_COUNT; i++) {
        const hb = hemeRefs.current[i]
        if (hb) {
          const mat = hb.material as THREE.MeshStandardMaterial
          mat.color.set('#cc8866')
        }
      }
    }
    if (phase === 'diffusing' && !doneRef.current) {
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

      <mesh position={[-0.75, 0, 0]}>
        <planeGeometry args={[1.6, 3]} />
        <meshBasicMaterial color="#4488ff" transparent opacity={0.035} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.1, 0, 0]}>
        <planeGeometry args={[2.2, 3]} />
        <meshBasicMaterial color="#ff8888" transparent opacity={0.035} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[0.04, 3]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      <Text position={[-0.75, 1.35, 0]} fontSize={0.14} color="rgba(255,255,255,0.35)" anchorX="center" anchorY="middle">
        Alveolus
      </Text>
      <Text position={[0, 1.35, 0]} fontSize={0.1} color="rgba(255,255,255,0.25)" anchorX="center" anchorY="middle">
        Membrane
      </Text>
      <Text position={[1.1, 1.35, 0]} fontSize={0.14} color="rgba(255,255,255,0.35)" anchorX="center" anchorY="middle">
        Plasma
      </Text>
      <Text position={[1.1, -0.9, 0]} fontSize={0.13} color="#c04040" anchorX="center" anchorY="middle">
        Red Blood Cell
      </Text>

      <RedBloodCell hbPositions={hbPositions} hemeRefs={hemeRefs} />
      <OxygenParticles phase={phase} progress={progressRef} hbPositions={hbPositions} hemeRefs={hemeRefs} boundFlags={boundFlags} />
      <CO2Particles phase={phase} progress={progressRef} />
    </>
  )
}

export function CrossSectionScene({ phase, onDiffuse, onPhaseComplete, onReset }: {
  phase: CrossSectionPhase
  onDiffuse: () => void
  onPhaseComplete: () => void
  onReset: () => void
}) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 3.8]} fov={42} />
        <SceneInner phase={phase} onPhaseComplete={onPhaseComplete} />
      </Canvas>

      {phase !== 'diffusing' && (
        <div style={{
          position: 'absolute',
          bottom: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#eeeeee',
            margin: 0,
            marginBottom: 6,
            letterSpacing: 2,
          }}>
            Oxygen in Blood
          </h1>
          <div style={{ maxWidth: 520 }}>
            {phase === 'resting' && (
              <>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.6)',
                  margin: 0,
                  marginBottom: 6,
                  lineHeight: 1.6,
                }}>
                  At the alveolar-capillary interface, oxygen diffuses down its concentration gradient
                  across the respiratory membrane into the blood plasma, then enters red blood cells
                  where it binds to hemoglobin. Each Hb molecule contains 4 heme groups — one binding site for O₂.
                </p>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.35)',
                  margin: 0,
                  marginBottom: 24,
                  lineHeight: 1.5,
                }}>
                  Press <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Diffuse</strong> to watch O₂ cross the membrane, pass through plasma, and bind to heme inside the RBC.
                </p>
              </>
            )}
            {phase === 'complete' && (
              <>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.6)',
                  margin: 0,
                  marginBottom: 6,
                  lineHeight: 1.6,
                }}>
                  4 of 5 heme sites are now occupied — each binds one O₂ molecule. Red blood cells
                  then travel through the circulation to deliver oxygen to tissues, where cellular
                  respiration uses it to produce ATP.
                </p>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.35)',
                  margin: 0,
                  marginBottom: 24,
                  lineHeight: 1.5,
                }}>
                  CO₂ waste from respiring cells diffuses from the blood back into the alveolus to be exhaled.
                </p>
              </>
            )}
          </div>
          {phase === 'resting' && (
            <button onClick={onDiffuse} style={btnStyle}>Diffuse</button>
          )}
          {phase === 'complete' && (
            <button onClick={onReset} style={{ ...btnStyle, borderColor: 'rgba(255,255,255,0.3)', color: '#aaa' }}>
              Reset
            </button>
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
