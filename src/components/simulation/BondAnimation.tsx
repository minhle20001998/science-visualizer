import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SceneOrb } from './SceneOrb'
import type { SceneData } from '../../data/scenes/rnaWorld'

const BONE_IDXS = [0, 1, 2, 3, 4]
const BONE_START = [new THREE.Vector3(-3.5, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(3.5, 0, 0)]
const BONE_FINAL = [new THREE.Vector3(-3, 0, 0), new THREE.Vector3(-1.5, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(1.5, 0, 0), new THREE.Vector3(3, 0, 0)]
const BONE_CONNS: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4]]

const BASE_IDXS = [5, 6, 7]
const BASE_FINAL: Record<number, THREE.Vector3> = {
  5: new THREE.Vector3(-3, -1.5, 0.5),
  6: new THREE.Vector3(0, -1.5, 0.5),
  7: new THREE.Vector3(3, -1.5, 0.5),
}
const BASE_CONNS: [number, number][] = [[0, 5], [2, 6], [4, 7]]

const STATIC_IDXS = [9, 10, 11, 12]

function randPos(): THREE.Vector3 {
  const r = 5 + Math.random() * 4
  const t = Math.random() * Math.PI * 2
  const p = Math.acos(2 * Math.random() - 1)
  return new THREE.Vector3(r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t))
}

function randQuat(): THREE.Quaternion {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6))
}

interface BondSpawn { pos: THREE.Vector3; quat: THREE.Quaternion }
interface ConnFinal { pos: THREE.Vector3; quat: THREE.Quaternion; len: number }

function connFinal(a: THREE.Vector3, b: THREE.Vector3): ConnFinal {
  const mid = new THREE.Vector3().copy(a).add(b).multiplyScalar(0.5)
  const dir = new THREE.Vector3().copy(b).sub(a).normalize()
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
  return { pos: mid, quat, len: a.distanceTo(b) }
}

export function BondAnimation({
  scene,
  animating,
  backboneDone,
  basesDone,
  onBackboneComplete,
  onBasesComplete,
  onOrbClick,
}: {
  scene: SceneData
  animating: 'none' | 'backbone' | 'bases'
  backboneDone: boolean
  basesDone: boolean
  onBackboneComplete: () => void
  onBasesComplete: () => void
  onOrbClick: (key: string) => void
}) {
  const orbRefs = useRef<(THREE.Group | null)[]>([])
  const h2oRef = useRef<THREE.Group>(null!)
  const boneBondRefs = useRef<(THREE.Mesh | null)[]>([])
  const baseBondRefs = useRef<(THREE.Mesh | null)[]>([])

  const progress = useRef(0)
  const running = useRef(false)
  const prevAnimating = useRef<'none' | 'backbone' | 'bases'>('none')

  const bondSpawns = useMemo<BondSpawn[]>(() => BONE_CONNS.map(() => ({ pos: randPos(), quat: randQuat() })), [])
  const boneFinals = useMemo<ConnFinal[]>(() => BONE_CONNS.map(c => connFinal(BONE_FINAL[c[0]], BONE_FINAL[c[1]])), [])
  const baseBoneFinals = useMemo<ConnFinal[]>(() => BASE_CONNS.map(c => connFinal(BONE_FINAL[c[0]], BASE_FINAL[c[1]])), [])
  const baseSpawns = useMemo<BondSpawn[]>(() => BASE_CONNS.map(() => ({ pos: randPos(), quat: randQuat() })), [])
  const baseStartPositions = useMemo<THREE.Vector3[]>(() => BASE_IDXS.map(() => randPos()), [])

  const bStart = useMemo(() => BONE_START.map(v => v.clone()), [])
  const bFinal = useMemo(() => BONE_FINAL.map(v => v.clone()), [])

  useFrame((_, delta) => {
    const started = animating !== 'none' && animating !== prevAnimating.current
    if (started) {
      running.current = true
      progress.current = 0
    }
    prevAnimating.current = animating

    const phase = animating
    const t = Math.min(progress.current, 1)

    const boneP = phase === 'backbone' ? Math.min(t / 0.5, 1) : backboneDone ? 1 : 0
    const baseP = phase === 'bases' ? Math.min(t / 0.5, 1) : basesDone ? 1 : 0
    const boneEase = boneP < 0.5 ? 2 * boneP * boneP : -1 + (4 - 2 * boneP) * boneP
    const baseEase = baseP < 0.5 ? 2 * baseP * baseP : -1 + (4 - 2 * baseP) * baseP

    for (let i = 0; i < BONE_IDXS.length; i++) {
      const g = orbRefs.current[BONE_IDXS[i]]
      if (g) g.position.lerpVectors(bStart[i], bFinal[i], boneEase)
    }

    for (let i = 0; i < BASE_IDXS.length; i++) {
      const idx = BASE_IDXS[i]
      const g = orbRefs.current[idx]
      if (g) g.position.lerpVectors(baseStartPositions[i], BASE_FINAL[idx], baseEase)
    }

    // Backbone bond rods
    for (let i = 0; i < BONE_CONNS.length; i++) {
      const m = boneBondRefs.current[i]
      if (!m) continue
      const { pos, quat } = boneFinals[i]
      const spawn = bondSpawns[i]
      if (backboneDone || boneP >= 1) {
        m.position.copy(pos); m.quaternion.copy(quat)
      } else if (phase === 'backbone') {
        m.position.lerpVectors(spawn.pos, pos, boneP)
        m.quaternion.slerpQuaternions(spawn.quat, quat, boneP)
      } else {
        m.position.copy(spawn.pos); m.quaternion.copy(spawn.quat)
      }
      m.scale.y = (backboneDone || boneP > 0) ? 1 : 0
    }

    // Base bond rods
    for (let i = 0; i < BASE_CONNS.length; i++) {
      const m = baseBondRefs.current[i]
      if (!m) continue
      const { pos, quat } = baseBoneFinals[i]
      const spawn = baseSpawns[i]
      if (basesDone || baseP >= 1) {
        m.position.copy(pos); m.quaternion.copy(quat)
      } else if (phase === 'bases') {
        m.position.lerpVectors(spawn.pos, pos, baseP)
        m.quaternion.slerpQuaternions(spawn.quat, quat, baseP)
      } else {
        m.position.copy(spawn.pos); m.quaternion.copy(spawn.quat)
        m.scale.y = 0
      }
      m.scale.y = (basesDone || baseP > 0) ? 1 : 0
    }

    // H2O fade
    if (h2oRef.current) {
      const fadeStart = basesDone ? 1 : phase === 'bases' ? Math.min(Math.max((t - 0.5) / 0.2, 0), 1) : 0
      h2oRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.transparent = fadeStart > 0
          child.material.opacity = 1 - fadeStart
        }
      })
    }

    if (started || running.current) {
      if (phase === 'backbone' && boneP >= 1) {
        running.current = false
        onBackboneComplete()
      }
      if (phase === 'bases' && baseP >= 1) {
        running.current = false
        onBasesComplete()
      }
      if (running.current) {
        progress.current += delta / 2
      }
    }
  })

  const sRef = (i: number) => (el: THREE.Group | null) => { orbRefs.current[i] = el }
  const bRef = (i: number) => (el: THREE.Mesh | null) => { boneBondRefs.current[i] = el }
  const brRef = (i: number) => (el: THREE.Mesh | null) => { baseBondRefs.current[i] = el }

  return (
    <>
      {BONE_IDXS.map(i => (
        <group key={i} ref={sRef(i)}>
          <SceneOrb element={scene.orbs[i].element} detailKey={scene.orbs[i].detailKey} position={[0, 0, 0]} onClick={onOrbClick} />
        </group>
      ))}
      {BASE_IDXS.map(i => (
        <group key={i} ref={sRef(i)}>
          <SceneOrb element={scene.orbs[i].element} detailKey={scene.orbs[i].detailKey} position={[0, 0, 0]} onClick={onOrbClick} />
        </group>
      ))}
      <group ref={h2oRef} position={[0, 2.5, 0]}>
        <SceneOrb element="H2O" detailKey="H2O" position={[0, 0, 0]} onClick={onOrbClick} />
      </group>
      {STATIC_IDXS.map(i => (
        <SceneOrb key={i} element={scene.orbs[i].element} detailKey={scene.orbs[i].detailKey} position={scene.orbs[i].position} onClick={onOrbClick} />
      ))}
      {boneFinals.map((bf, i) => (
        <mesh key={`b${i}`} ref={bRef(i)}>
          <cylinderGeometry args={[0.04, 0.04, bf.len, 8]} />
          <meshBasicMaterial color="#ff9900" />
        </mesh>
      ))}
      {baseBoneFinals.map((bf, i) => (
        <mesh key={`br${i}`} ref={brRef(i)}>
          <cylinderGeometry args={[0.03, 0.03, bf.len, 8]} />
          <meshBasicMaterial color="#88ddff" />
        </mesh>
      ))}
    </>
  )
}
