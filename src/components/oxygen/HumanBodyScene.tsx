import { useRef, useMemo, useCallback, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Text, useTexture } from '@react-three/drei'
import * as THREE from 'three'

const INHALE_TARGET = new THREE.Vector3(0, 1.5, 0)
const CONVERGE_SPEED = 1.2
const DISTANCE_THRESHOLD = 0.15

function BodyImage() {
  const texture = useTexture('/humanbody.svg')
  return (
    <mesh position={[0, 0.2, 0]}>
      <planeGeometry args={[3, 3]} />
      <meshBasicMaterial map={texture} transparent depthTest={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

function O2Orb({
  pos,
  phase,
  inhaling,
  onArrived,
}: {
  pos: [number, number, number]
  phase: number
  inhaling: boolean
  onArrived: () => void
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const base = useMemo(() => new THREE.Vector3(...pos), [pos])
  const current = useRef(new THREE.Vector3(...pos))
  const pRef = useRef(phase)
  const r = useMemo(() => 0.12 + Math.random() * 0.1, [])
  const arrived = useRef(false)

  useFrame((state, delta) => {
    if (inhaling && !arrived.current) {
      const target = INHALE_TARGET
      current.current.lerp(target, delta * CONVERGE_SPEED)
      if (current.current.distanceTo(target) < DISTANCE_THRESHOLD) {
        current.current.copy(target)
        arrived.current = true
        onArrived()
      }
    } else if (!inhaling) {
      arrived.current = false
      const t = state.clock.elapsedTime
      current.current.set(
        base.x + Math.sin(t * 0.25 + pRef.current) * 0.4,
        base.y + Math.cos(t * 0.18 + pRef.current * 1.4) * 0.4,
        base.z + Math.sin(t * 0.2 + pRef.current * 0.8) * 0.4,
      )
    }
    groupRef.current.position.copy(current.current)
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[r, 16, 16]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.25}
          roughness={0.15}
          metalness={0.05}
        />
      </mesh>
      <Text position={[0, r + 0.12, 0]} fontSize={0.15} color="#88eeff" anchorX="center" anchorY="middle" fontWeight={700}>
        O2
      </Text>
    </group>
  )
}

function O2Cloud({ inhaling, onAllArrived }: { inhaling: boolean; onAllArrived: () => void }) {
  const orbs = useMemo(() => {
    const pts: { pos: [number, number, number]; phase: number }[] = []
    for (let i = 0; i < 25; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 1.5 + Math.random() * 2.5
      pts.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi) * 0.8,
          r * Math.sin(phi) * Math.sin(theta),
        ],
        phase: Math.random() * Math.PI * 2,
      })
    }
    return pts
  }, [])

  const arrivedCount = useRef(0)
  const total = orbs.length
  const triggered = useRef(false)

  const handleArrived = useCallback(() => {
    arrivedCount.current++
    if (arrivedCount.current >= total && !triggered.current) {
      triggered.current = true
      onAllArrived()
    }
  }, [total, onAllArrived])

  if (!inhaling) {
    arrivedCount.current = 0
    triggered.current = false
  }

  return (
    <>
      {orbs.map((o, i) => (
        <O2Orb key={i} pos={o.pos} phase={o.phase} inhaling={inhaling} onArrived={handleArrived} />
      ))}
    </>
  )
}

function SceneInner({ inhaling, onAllArrived }: { inhaling: boolean; onAllArrived: () => void }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 6]} intensity={0.6} />
      <BodyImage />
      <O2Cloud inhaling={inhaling} onAllArrived={onAllArrived} />
    </>
  )
}

export function HumanBodyScene({ onInhale }: { onInhale: () => void }) {
  const [inhaling, setInhaling] = useState(false)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 6.5]} fov={45} />
        <OrbitControls enablePan={false} enableZoom={true} maxDistance={14} minDistance={3} />
        <SceneInner inhaling={inhaling} onAllArrived={onInhale} />
      </Canvas>

      {!inhaling && (
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
          <p style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.35)',
            margin: 0,
            marginBottom: 24,
          }}>
            From the air we breathe to every cell in your body
          </p>
          <button
            onClick={() => setInhaling(true)}
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,180,220,0.08))',
              border: '1px solid rgba(0,212,255,0.35)',
              borderRadius: 12,
              padding: '12px 36px',
              color: '#00d4ff',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '1px',
              transition: 'all 0.25s',
              backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(0,180,220,0.15))'
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0,212,255,0.25)'
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.6)'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,180,220,0.08))'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            Inhale
          </button>
        </div>
      )}
    </div>
  )
}
