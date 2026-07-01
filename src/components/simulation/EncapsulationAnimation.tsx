import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SceneOrb } from './SceneOrb'
import { PhosphodiesterBond } from './PhosphodiesterBond'
import type { SceneData } from '../../data/scenes/rnaWorld'

const RNA_ORBS = 17

function fibSphere(n: number, r: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const rad = Math.sqrt(1 - y * y)
    const theta = phi * i
    pts.push(new THREE.Vector3(rad * Math.cos(theta) * r, y * r, rad * Math.sin(theta) * r))
  }
  return pts
}

function randSphere(r: number): THREE.Vector3 {
  const t = Math.random() * Math.PI * 2
  const p = Math.acos(2 * Math.random() - 1)
  return new THREE.Vector3(r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t))
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function EncapsulationAnimation({
  scene,
  encapsulating,
  encapsDone,
  showWater,
  onEncapsComplete,
  onOrbClick,
}: {
  scene: SceneData
  encapsulating: boolean
  encapsDone: boolean
  showWater: boolean
  onEncapsComplete: () => void
  onOrbClick: (key: string) => void
}) {
  const progress = useRef(0)
  const prevEncaps = useRef(false)
  const headRefs = useRef<(THREE.Group | null)[]>([])
  const tailRefs = useRef<(THREE.Group | null)[]>([])

  const rnaOrbs = useMemo(() => scene.orbs.slice(0, RNA_ORBS), [scene])
  const rnaCenter = useMemo(() => {
    const n = rnaOrbs.length
    if (n === 0) return new THREE.Vector3(0, 0, 0)
    const sum = rnaOrbs.reduce(
      (acc, o) => acc.add(new THREE.Vector3(o.position[0], o.position[1], o.position[2])),
      new THREE.Vector3()
    )
    return sum.divideScalar(n)
  }, [rnaOrbs])

  const LIPID_COUNT = 36

  const [startPosHead, startPosTail] = useMemo(() => {
    const heads: THREE.Vector3[] = []
    const tails: THREE.Vector3[] = []
    for (let i = 0; i < LIPID_COUNT; i++) {
      const dir = randSphere(1).normalize()
      heads.push(dir.clone().multiplyScalar(10 + Math.random() * 3).add(rnaCenter))
      tails.push(dir.clone().multiplyScalar(8 + Math.random() * 3).add(rnaCenter))
    }
    return [heads, tails]
  }, [rnaCenter])

  const shellPts = useMemo(() => fibSphere(LIPID_COUNT, 1), [])

  const headEndPos = useMemo(() =>
    shellPts.map((p, i) => p.clone().multiplyScalar(i < LIPID_COUNT / 2 ? 8.0 : 4.6).add(rnaCenter)), [rnaCenter]
  )
  const tailEndPos = useMemo(() =>
    shellPts.map((p, i) => p.clone().multiplyScalar(i < LIPID_COUNT / 2 ? 6.8 : 5.8).add(rnaCenter)), [rnaCenter]
  )

  const WATER_COUNT = 40

  const waterPos = useMemo(() => {
    return Array.from({ length: WATER_COUNT }, () =>
      randSphere(10 + Math.random() * 4).add(rnaCenter)
    )
  }, [rnaCenter])

  const waterRefs = useRef<(THREE.Group | null)[]>([])
  const waterPhase = useRef(Array.from({ length: WATER_COUNT }, () => Math.random() * Math.PI * 2))

  useFrame((state) => {
    if (!showWater) return
    const elapsed = state.clock.elapsedTime
    for (let i = 0; i < WATER_COUNT; i++) {
      const w = waterRefs.current[i]
      if (!w) continue
      const t = elapsed * 0.2 + waterPhase.current[i]
      w.position.x += Math.sin(t * 0.7 + waterPhase.current[i]) * 0.002
      w.position.y += Math.cos(t * 0.5 + waterPhase.current[i] * 1.3) * 0.002
      w.position.z += Math.sin(t * 0.6 + waterPhase.current[i] * 0.7) * 0.002
    }
  })

  useFrame((_, delta) => {
    // Detect start
    if (encapsulating && !prevEncaps.current) {
      prevEncaps.current = true
      progress.current = 0
    }

    if (encapsulating) {
      progress.current += delta * 0.3
      const t = easeInOutCubic(Math.min(progress.current, 1))

      for (let i = 0; i < LIPID_COUNT; i++) {
        const h = headRefs.current[i]
        const tl = tailRefs.current[i]
        if (!h || !tl) continue
        h.position.lerpVectors(startPosHead[i], headEndPos[i], t)
        tl.position.lerpVectors(startPosTail[i], tailEndPos[i], t)
      }

      if (progress.current >= 1) {
        prevEncaps.current = false
        onEncapsComplete()
      }
    } else if (!encapsDone) {
      // Reset to start positions if not done
      for (let i = 0; i < LIPID_COUNT; i++) {
        const h = headRefs.current[i]
        const tl = tailRefs.current[i]
        if (!h || !tl) continue
        h.position.copy(startPosHead[i])
        tl.position.copy(startPosTail[i])
      }
    }
  })

  const hRef = (i: number) => (el: THREE.Group | null) => { headRefs.current[i] = el }
  const tRef = (i: number) => (el: THREE.Group | null) => { tailRefs.current[i] = el }
  const wRef = (i: number) => (el: THREE.Group | null) => { waterRefs.current[i] = el }

  const bonds = scene.bonds

  return (
    <>
      {rnaOrbs.map((orb, i) => (
        <SceneOrb
          key={i}
          element={orb.element}
          detailKey={orb.detailKey}
          position={[orb.position[0], orb.position[1], orb.position[2]]}
          onClick={onOrbClick}
        />
      ))}

      {bonds.map((b, i) => (
        <PhosphodiesterBond
          key={i}
          start={rnaOrbs[b.from].position}
          end={rnaOrbs[b.to].position}
          type={(b.type === 3 ? 1 : b.type) as 1 | 2}
          progress={1}
        />
      ))}

      {Array.from({ length: LIPID_COUNT }).map((_, i) => (
        <group key={`h${i}`} ref={hRef(i)} position={startPosHead[i]}>
          <SceneOrb element="Phospholipid" detailKey="Phospho-head" position={[0, 0, 0]} onClick={onOrbClick} labelText="P" />
        </group>
      ))}
      {Array.from({ length: LIPID_COUNT }).map((_, i) => (
        <group key={`t${i}`} ref={tRef(i)} position={startPosTail[i]}>
          <SceneOrb element="Fatty-tail" detailKey="Fatty-tail" position={[0, 0, 0]} onClick={onOrbClick} labelText="T" />
        </group>
      ))}

      {encapsDone && Array.from({ length: LIPID_COUNT }).map((_, i) => {
        const h = headEndPos[i]
        const tl = tailEndPos[i]
        return (
          <PhosphodiesterBond key={`lb${i}`} start={h} end={tl} type={1} progress={1} />
        )
      })}

      {showWater && Array.from({ length: WATER_COUNT }).map((_, i) => (
        <group key={`w${i}`} ref={wRef(i)} position={waterPos[i]}>
          <SceneOrb element="H2O" detailKey="H2O" position={[0, 0, 0]} onClick={onOrbClick} hideLabel />
        </group>
      ))}
    </>
  )
}
