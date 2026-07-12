import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

const CENTER_RADIUS = 1.0
const SATELLITE_RADIUS = 0.9
const CLUSTER_RADIUS = 1.7

const SATELLITE_POSITIONS: [number, number, number][] = [
  [CLUSTER_RADIUS, 0.05, 0],
  [CLUSTER_RADIUS * 0.5, -0.15, CLUSTER_RADIUS * 0.866],
  [-CLUSTER_RADIUS * 0.5, 0.2, CLUSTER_RADIUS * 0.866],
  [-CLUSTER_RADIUS, -0.05, 0],
  [-CLUSTER_RADIUS * 0.5, 0.1, -CLUSTER_RADIUS * 0.866],
  [CLUSTER_RADIUS * 0.5, -0.2, -CLUSTER_RADIUS * 0.866],
]

const STALK_START_X = -5.5
const STALK_END_X = -2.0
const STALK_LEN = STALK_END_X - STALK_START_X
const O2_COUNT = 14
const O2_FLOW_SPEED = 0.35
const SCALE_SPEED = 0.5
const SCALE_TARGET = 1.5
const DIFFUSE_SPEED = 0.35
const CAPILLARY_X = 3.5
const RBC_LOCAL: [number, number, number][] = [
  [-0.5, 0, 0],
  [0.5, 0, 0],
  [1.5, 0, 0],
]

function GrapeCluster({ scaleRef }: { scaleRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    groupRef.current.scale.setScalar(scaleRef.current)
  })
  const color = '#e8c8a0'
  const emissive = '#a08060'
  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[CENTER_RADIUS, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} emissive={emissive} emissiveIntensity={0.08} transparent opacity={0.75} />
      </mesh>
      {SATELLITE_POSITIONS.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[SATELLITE_RADIUS, 32, 32]} />
          <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} emissive={emissive} emissiveIntensity={0.08} transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  )
}

function BronchioleTube() {
  return (
    <group position={[-3.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.4, 4.2, 10, 1, true]} />
        <meshStandardMaterial color="#d4a8a0" roughness={0.8} metalness={0} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function OxygenParticles({ phase, flowRef, diffuseRef }: {
  phase: AlveolusPhase
  flowRef: React.MutableRefObject<number>
  diffuseRef: React.MutableRefObject<number>
}) {
  const orbs = useMemo(() => {
    const pts: { tubeDelay: number; offset: [number, number, number]; r: number; xDelay: number }[] = []
    for (let i = 0; i < O2_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const dist = 0.3 + Math.random() * 1.2
      pts.push({
        tubeDelay: (i / O2_COUNT) * 0.5,
        offset: [
          dist * Math.sin(phi) * Math.cos(theta),
          dist * Math.cos(phi),
          dist * Math.sin(phi) * Math.sin(theta),
        ],
        r: 0.07 + Math.random() * 0.06,
        xDelay: Math.random() * 0.4,
      })
    }
    return pts
  }, [])

  const refs = useRef<(THREE.Mesh | null)[]>([])
  const finalPos = useRef<THREE.Vector3[]>([])

  useFrame((_, delta) => {
    if (phase === 'inhaling') {
      flowRef.current = Math.min(1, flowRef.current + delta * O2_FLOW_SPEED)
    }
    const fp = flowRef.current
    const dp = diffuseRef.current

    orbs.forEach((orb, i) => {
      const m = refs.current[i]
      if (!m) return
      if (phase === 'resting') { m.visible = false; return }

      // inhaled: stay at cluster positions
      if (phase === 'inhaled') {
        m.visible = true
        if (!finalPos.current[i]) finalPos.current[i] = new THREE.Vector3(orb.offset[0], orb.offset[1], orb.offset[2])
        m.position.copy(finalPos.current[i])
        m.scale.setScalar(1)
        return
      }

      // inhaling: flow through tube
      if (phase === 'inhaling') {
        const entry = orb.tubeDelay
        const exit = entry + 0.4
        if (fp < entry) { m.visible = false; return }
        if (fp > exit) {
          m.visible = true
          if (!finalPos.current[i]) finalPos.current[i] = new THREE.Vector3(orb.offset[0], orb.offset[1], orb.offset[2])
          m.position.copy(finalPos.current[i])
          return
        }
        m.visible = true
        const t = (fp - entry) / (exit - entry)
        if (t < 0.5) {
          const tt = t / 0.5
          m.position.set(STALK_START_X + tt * STALK_LEN, (orb.tubeDelay - 0.25) * 0.06, (orb.tubeDelay * 1.7) * 0.06)
        } else {
          const ct = (t - 0.5) / 0.5
          const ease = ct * ct * (3 - 2 * ct)
          m.position.set(STALK_END_X + (orb.offset[0] - STALK_END_X) * ease, orb.offset[1] * ease, orb.offset[2] * ease)
        }
        m.scale.setScalar(1)
        return
      }

      // diffusing: cross membrane → converge on RBC → RBC carries it away
      if (phase === 'diffusing') {
        const from = finalPos.current[i] || new THREE.Vector3(orb.offset[0], orb.offset[1], orb.offset[2])
        const rbcIdx = i % RBC_LOCAL.length
        const local = Math.max(0, Math.min(1, dp - orb.xDelay))

        if (dp < 0.35) {
          // cross membrane toward RBC (staggered by xDelay)
          if (local <= 0) {
            if (!finalPos.current[i]) finalPos.current[i] = new THREE.Vector3(orb.offset[0], orb.offset[1], orb.offset[2])
            m.position.copy(finalPos.current[i])
            m.scale.setScalar(1)
            m.visible = true
            return
          }
          const t = local / 0.35
          const ease = t * t * (3 - 2 * t)
          const targetX = CAPILLARY_X + RBC_LOCAL[rbcIdx][0]
          const targetY = RBC_LOCAL[rbcIdx][1] + (Math.sin(i * 1.3) * 0.15)
          const targetZ = RBC_LOCAL[rbcIdx][2] + (Math.cos(i * 0.7) * 0.15)
          m.position.set(
            from.x + (targetX - from.x) * ease,
            from.y + (targetY - from.y) * ease,
            from.z + (targetZ - from.z) * ease,
          )
          m.scale.setScalar(1)
          m.visible = true
        } else if (dp < 0.5) {
          // converge onto RBC center, shrink (all orbs in sync)
          const t = (dp - 0.35) / 0.15
          const ease = t * t * (3 - 2 * t)
          const targetX = CAPILLARY_X + RBC_LOCAL[rbcIdx][0]
          m.position.set(
            from.x + (targetX - from.x) * ease,
            RBC_LOCAL[rbcIdx][1],
            RBC_LOCAL[rbcIdx][2],
          )
          m.scale.setScalar(1 - ease * 0.85)
          m.visible = true
        } else {
          // merged into RBC — ride along (all orbs in sync)
          const ride = (dp - 0.5) / 0.5
          m.position.set(
            CAPILLARY_X + RBC_LOCAL[rbcIdx][0] + ride * 5,
            RBC_LOCAL[rbcIdx][1],
            RBC_LOCAL[rbcIdx][2],
          )
          m.scale.setScalar(0.15 * (1 - ride * 0.8))
          m.visible = ride < 0.95
        }
        return
      }

      // complete: hidden
      if (phase === 'complete') { m.visible = false }
    })
  })

  return (
    <>
      {orbs.map((orb, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el }} visible={false}>
          <sphereGeometry args={[orb.r, 10, 10]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.7} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}

function RBCs({ phase, diffuseRef }: {
  phase: AlveolusPhase
  diffuseRef: React.MutableRefObject<number>
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const brightTarget = useRef(new THREE.Color('#ff6060'))

  useFrame(() => {
    const dp = diffuseRef.current
    RBC_LOCAL.forEach((pos, i) => {
      const m = refs.current[i]
      if (!m) return
      const mat = m.material as THREE.MeshStandardMaterial

      if (phase === 'diffusing') {
        mat.transparent = true
        mat.depthWrite = false
        m.visible = dp < 1

        if (dp < 0.35) {
          m.position.x = pos[0]
          mat.opacity = 0.7
          mat.color.set('#c04040')
        } else if (dp < 0.5) {
          mat.opacity = 0.2
          m.position.x = pos[0]
          mat.color.lerp(brightTarget.current, 0.06)
        } else if (dp < 0.55) {
          mat.opacity = 0.25
          m.position.x = pos[0]
          mat.color.lerp(brightTarget.current, 0.1)
        } else {
          const fade = Math.min(1, (dp - 0.55) / 0.45)
          m.position.x = pos[0] + fade * 5
          mat.opacity = 0.25 * (1 - fade)
        }
      } else if (phase === 'complete') {
        m.visible = false
      } else {
        m.position.x = pos[0]
        mat.transparent = false
        mat.depthWrite = true
        mat.opacity = 1
        m.visible = true
        mat.color.set('#c04040')
      }
    })
  })

  return (
    <group position={[CAPILLARY_X, 0, 0]}>
      {RBC_LOCAL.map((pos, i) => (
        <mesh key={i} position={pos} ref={(el) => { refs.current[i] = el }} renderOrder={1}>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial color="#c04040" roughness={0.4} emissive="#c04040" emissiveIntensity={0.1} />
        </mesh>
      ))}
    </group>
  )
}

function CO2Particles({ phase, diffuseRef }: {
  phase: AlveolusPhase
  diffuseRef: React.MutableRefObject<number>
}) {
  const count = 4
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const startPos = useMemo(() =>
    Array.from({ length: count }, (_, i) => {
      const rbc = RBC_LOCAL[i % RBC_LOCAL.length]
      return [CAPILLARY_X + rbc[0] + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4] as [number, number, number]
    }),
    [],
  )

  useFrame(() => {
    const dp = diffuseRef.current
    for (let i = 0; i < count; i++) {
      const m = refs.current[i]
      if (!m) return
      if (phase === 'diffusing' && dp > 0.15) {
        m.visible = true
        const local = Math.min(1, (dp - 0.15) / 0.7)
        const ease = local * local * (3 - 2 * local)
        const s = startPos[i]
        const endX = -1.5 + Math.random() * 1
        m.position.set(
          s[0] + (endX - s[0]) * ease,
          s[1] * (1 - ease * 0.5),
          s[2] * (1 - ease * 0.5),
        )
        m.scale.setScalar(1 + ease * 0.3)
      } else {
        m.visible = false
      }
    }
  })

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el }} visible={false}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color="#ff4444" transparent opacity={0.6} />
        </mesh>
      ))}
    </>
  )
}

function CapillaryWall() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame(() => {
    const mat = meshRef.current?.material as THREE.MeshStandardMaterial | undefined
    if (mat) {
      mat.depthWrite = false
    }
  })

  return (
    <group position={[CAPILLARY_X, 0, 0]}>
      <mesh ref={meshRef} renderOrder={0} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.8, 0.8, 3.5, 16, 1, true]} />
        <meshStandardMaterial color="#c8a8f0" transparent opacity={0.12} side={THREE.DoubleSide} roughness={0.5} depthWrite={false} />
      </mesh>
    </group>
  )
}

function SceneContent({ phase, onPhaseComplete }: {
  phase: AlveolusPhase
  onPhaseComplete: (p: AlveolusPhase) => void
}) {
  const scaleRef = useRef(1.0)
  const flowRef = useRef(0)
  const diffuseRef = useRef(0)
  const scaleDone = useRef(false)
  const transRef = useRef(false)
  const diffDone = useRef(false)

  useFrame((_, delta) => {
    if (phase === 'resting') {
      scaleRef.current = 1; flowRef.current = 0; diffuseRef.current = 0
      scaleDone.current = false; transRef.current = false; diffDone.current = false
    }
    if (phase === 'inhaling') {
      if (!scaleDone.current) {
        scaleRef.current = Math.min(SCALE_TARGET, scaleRef.current + delta * SCALE_SPEED)
        if (scaleRef.current >= SCALE_TARGET - 0.01) scaleDone.current = true
      } else {
        scaleRef.current = SCALE_TARGET
        if (flowRef.current >= 1 && !transRef.current) {
          transRef.current = true; onPhaseComplete('inhaled')
        }
      }
    }
    if (phase === 'diffusing') {
      diffuseRef.current = Math.min(1, diffuseRef.current + delta * DIFFUSE_SPEED)
      if (diffuseRef.current >= 1 && !diffDone.current) {
        diffDone.current = true
        setTimeout(() => onPhaseComplete('complete'), 300)
      }
    }
    if (phase === 'inhaled' || phase === 'diffusing' || phase === 'complete') {
      scaleRef.current = SCALE_TARGET
    }
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-3, 2, -3]} intensity={0.3} />
      <BronchioleTube />
      <GrapeCluster scaleRef={scaleRef} />
      <OxygenParticles phase={phase} flowRef={flowRef} diffuseRef={diffuseRef} />
      <CO2Particles phase={phase} diffuseRef={diffuseRef} />
      <CapillaryWall />
      <RBCs phase={phase} diffuseRef={diffuseRef} />
    </>
  )
}

export type AlveolusPhase = 'resting' | 'inhaling' | 'inhaled' | 'diffusing' | 'complete'

export function AlveolusScene({ phase, onInhale, onDiffuse, onPhaseComplete }: {
  phase: AlveolusPhase
  onInhale: () => void
  onDiffuse: () => void
  onPhaseComplete: (p: AlveolusPhase) => void
}) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={45} />
        <OrbitControls enablePan={false} enableZoom={true} maxDistance={18} minDistance={4} />
        <SceneContent phase={phase} onPhaseComplete={onPhaseComplete} />
      </Canvas>

      {phase !== 'inhaling' && phase !== 'diffusing' && (
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
                  Each lung contains ~300 million alveoli — tiny air sacs where gas exchange occurs.
                  Their thin walls and dense capillary network maximize O₂ absorption.
                </p>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.35)',
                  margin: 0,
                  marginBottom: 24,
                  lineHeight: 1.5,
                }}>
                  Press <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Inhale</strong> to pull oxygen through the bronchiole into the alveolus.
                </p>
              </>
            )}
            {phase === 'inhaled' && (
              <>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.6)',
                  margin: 0,
                  marginBottom: 6,
                  lineHeight: 1.6,
                }}>
                  Oxygen concentration is now higher inside the alveolus than in the blood — a steep
                  concentration gradient drives O₂ across the respiratory membrane via passive diffusion.
                </p>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.35)',
                  margin: 0,
                  marginBottom: 24,
                  lineHeight: 1.5,
                }}>
                  Press <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Diffuse</strong> to watch O₂ cross into the capillary and bind to hemoglobin in red blood cells.
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
                  O₂ binds to hemoglobin (each RBC carries ~270 million heme molecules) and is
                  transported through the bloodstream to tissues throughout the body, where it fuels
                  cellular respiration.
                </p>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.35)',
                  margin: 0,
                  marginBottom: 24,
                  lineHeight: 1.5,
                }}>
                  Meanwhile, CO₂ waste diffuses from blood back into the alveolus to be exhaled.
                </p>
              </>
            )}
          </div>
          {phase === 'resting' && (
            <button onClick={onInhale} style={btnStyle}>Inhale</button>
          )}
          {phase === 'inhaled' && (
            <button onClick={onDiffuse} style={btnStyle}>Diffuse</button>
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
