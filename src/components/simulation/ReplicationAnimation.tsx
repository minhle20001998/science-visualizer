import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SceneOrb } from './SceneOrb'
import { PhosphodiesterBond } from './PhosphodiesterBond'
import type { SceneData } from '../../data/scenes/rnaWorld'

const TPL_BB = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const TPL_BS = [11, 12, 13, 14, 15, 16]
const SOUP_IX = [47, 48, 49, 50, 51, 52, 53, 54, 55, 56]

const TPL_POS: THREE.Vector3[] = [
  [0, 0, 0], [0, 0.8, 0], [0, 1.6, 0], [1.0, 2.6, 0], [2.0, 2.6, 0],
  [2.0, 1.6, 0], [2.0, 0.8, 0], [2.0, 0, 0], [2.0, -0.8, 0],
  [3.0, -1.8, 0], [4.0, -0.8, 0],
  [0.7, 0, 0.8], [0.7, 1.6, 0.8], [1.3, 2.6, 0.8],
  [1.3, 0.8, 0.8], [2.7, -0.8, 0.8], [4.7, -0.8, 0.8],
].map(p => new THREE.Vector3(p[0], p[1], p[2]))

const NTP_DOCK: THREE.Vector3[] = [
  [0.7, 0, 1.6], [0.7, 1.6, 1.6], [1.3, 2.6, 1.6],
  [1.3, 0.8, 1.6], [2.7, -0.8, 1.6], [4.7, -0.8, 1.6],
].map(p => new THREE.Vector3(p[0], p[1], p[2]))

const FINAL_BS: THREE.Vector3[] = [
  [5.7, 0, 0.8], [5.7, 1.6, 0.8], [6.3, 2.6, 0.8],
  [6.3, 0.8, 0.8], [7.7, -0.8, 0.8], [9.7, -0.8, 0.8],
].map(p => new THREE.Vector3(p[0], p[1], p[2]))

const FINAL_RB: THREE.Vector3[] = [
  [5.0, 0, 0], [5.0, 1.6, 0], [7.0, 2.6, 0],
  [7.0, 0.8, 0], [7.0, -0.8, 0], [9.0, -0.8, 0],
].map(p => new THREE.Vector3(p[0], p[1], p[2]))

const FINAL_PA: THREE.Vector3[] = [
  [5.0, 0.8, 0], [6.0, 2.6, 0], [7.0, 1.6, 0],
  [7.0, 0, 0], [8.0, -1.8, 0], [10.0, -0.8, 0],
].map(p => new THREE.Vector3(p[0], p[1], p[2]))

const NTP2_DOCK: THREE.Vector3[] = FINAL_BS.map(p => new THREE.Vector3(p.x, p.y, p.z + 0.8))

const FINAL2_RB: THREE.Vector3[] = FINAL_RB.map(p => new THREE.Vector3(p.x + 6, p.y, p.z))
const FINAL2_PA: THREE.Vector3[] = FINAL_PA.map(p => new THREE.Vector3(p.x + 6, p.y, p.z))
const FINAL2_BS: THREE.Vector3[] = FINAL_BS.map(p => new THREE.Vector3(p.x + 6, p.y, p.z))

const NTP_BS_ELEMENTS = ['U', 'C', 'G', 'A', 'U', 'C']
const NTP2_BS_ELEMENTS = ['A', 'G', 'C', 'U', 'A', 'G']

const DOCK_RB_OFF = new THREE.Vector3(-0.6, -0.35, -0.6)
const DOCK_PA_OFF = new THREE.Vector3(0, 0, 0.7)
const DOCK_PPI_OFF = new THREE.Vector3(0, 0, 1.825)
const PPi_LOCAL_B = new THREE.Vector3(0, 0, -0.375)
const PPi_LOCAL_C = new THREE.Vector3(0, 0, 0.375)

const unitCylGeo = new THREE.CylinderGeometry(1, 1, 1, 8)

function randSphere(r: number): THREE.Vector3 {
  const t = Math.random() * Math.PI * 2
  const p = Math.acos(2 * Math.random() - 1)
  return new THREE.Vector3(r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t))
}

function easeQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function AnimatedBond({
  startRef,
  endRef,
  progress = 1,
  type = 1,
}: {
  startRef: THREE.Vector3
  endRef: THREE.Vector3
  progress?: number
  type?: 1 | 2
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const radius = type === 2 ? 0.025 : 0.04
  const color = type === 2 ? '#88ddff' : '#ff9900'

  useFrame(() => {
    const m = meshRef.current
    if (!m) return
    const dir = new THREE.Vector3().copy(endRef).sub(startRef)
    const len = dir.length()
    if (len < 0.001) return

    const mid = new THREE.Vector3().copy(startRef).add(dir.clone().multiplyScalar(0.5))
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())

    m.position.copy(mid)
    m.quaternion.copy(q)
    m.scale.set(radius, len * progress, radius)
    const mat = m.material as THREE.MeshBasicMaterial
    mat.opacity = Math.min(progress * 2, 1)
  })

  return (
    <mesh ref={meshRef} geometry={unitCylGeo}>
      <meshBasicMaterial color={color} transparent opacity={0} />
    </mesh>
  )
}

export function ReplicationAnimation({
  scene,
  phase,
  phase1Done,
  phase2Done,
  phase3Done,
  phase4Done,
  onPhase1Complete,
  onPhase2Complete,
  onPhase3Complete,
  onPhase4Complete,
  onOrbClick,
}: {
  scene: SceneData
  phase: 0 | 1 | 2 | 3 | 4
  phase1Done: boolean
  phase2Done: boolean
  phase3Done: boolean
  phase4Done: boolean
  onPhase1Complete: () => void
  onPhase2Complete: () => void
  onPhase3Complete: () => void
  onPhase4Complete: () => void
  onOrbClick: (key: string) => void
}) {
  const templateRef = useRef<THREE.Group>(null!)
  const rbRefs = useRef<(THREE.Group | null)[]>([])
  const paRefs = useRef<(THREE.Group | null)[]>([])
  const bsRefs = useRef<(THREE.Group | null)[]>([])
  const ppiRefs = useRef<(THREE.Group | null)[]>([])
  const rb2Refs = useRef<(THREE.Group | null)[]>([])
  const pa2Refs = useRef<(THREE.Group | null)[]>([])
  const bs2Refs = useRef<(THREE.Group | null)[]>([])
  const ppi2Refs = useRef<(THREE.Group | null)[]>([])
  const progress = useRef(0)
  const running = useRef(false)
  const prevPhase = useRef<0 | 1 | 2 | 3 | 4>(0)
  const [showBackbone, setShowBackbone] = useState(false)
  const lastBbRef = useRef(false)
  const [showBackbone2, setShowBackbone2] = useState(false)
  const lastBb2Ref = useRef(false)
  const [, setSepBondP] = useState(0)
  const lastSepRef = useRef(0)
  const [sepBondP2, setSepBondP2] = useState(0)
  const lastSep2Ref = useRef(0)

  const centers = useMemo(() =>
    Array.from({ length: 6 }, () => randSphere(6)), []
  )
  const centers2 = useMemo(() =>
    Array.from({ length: 6 }, () => randSphere(9)), []
  )

  const rbStart = useMemo(() =>
    centers.map(c => c.clone().add(new THREE.Vector3(0, 0.5, 0))), []
  )
  const paStart = useMemo(() =>
    centers.map(c => c.clone().add(new THREE.Vector3(0.5, -0.35, 0.3))), []
  )
  const bsStart = useMemo(() =>
    centers.map(c => c.clone().add(new THREE.Vector3(-0.6, -0.2, 0))), []
  )
  const ppiStart = useMemo(() =>
    centers.map(c => c.clone().add(new THREE.Vector3(0, 0.35, 0.7))), []
  )
  const ppiRandom = useMemo(() =>
    Array.from({ length: 6 }, () => randSphere(12)), []
  )

  const rb2Start = useMemo(() =>
    centers2.map(c => c.clone().add(new THREE.Vector3(0, 0.5, 0))), []
  )
  const pa2Start = useMemo(() =>
    centers2.map(c => c.clone().add(new THREE.Vector3(0.5, -0.35, 0.3))), []
  )
  const bs2Start = useMemo(() =>
    centers2.map(c => c.clone().add(new THREE.Vector3(-0.6, -0.2, 0))), []
  )
  const ppi2Start = useMemo(() =>
    centers2.map(c => c.clone().add(new THREE.Vector3(0, 0.35, 0.7))), []
  )
  const ppi2Random = useMemo(() =>
    Array.from({ length: 6 }, () => randSphere(12)), []
  )

  const soupPos = useMemo(() =>
    SOUP_IX.map(() => { const v = randSphere(9); return [v.x, v.y, v.z] as [number, number, number] }), []
  )

  useFrame((_, delta) => {
    const started = phase !== 0 && phase !== prevPhase.current
    if (started) { running.current = true; progress.current = 0 }
    prevPhase.current = phase

    if (running.current) {
      progress.current += delta * 1.0
    }
    const raw = progress.current

    // Round 1
    const fuseP = phase === 1 ? easeQuad(Math.min(Math.max(raw - 6.5, 0) / 3.0, 1)) : (phase1Done ? 1 : 0)
    const sepP = phase === 2 ? easeQuad(Math.min(raw / 4.0, 1)) : phase2Done ? 1 : 0

    // Round 2
    const fuseP2 = phase === 3 ? easeQuad(Math.min(Math.max(raw - 6.5, 0) / 3.0, 1)) : (phase3Done ? 1 : 0)
    const sepP2 = phase === 4 ? easeQuad(Math.min(raw / 4.0, 1)) : phase4Done ? 1 : 0

    // Track backbone visibility
    const bb = fuseP > 0
    if (bb !== lastBbRef.current) { lastBbRef.current = bb; setShowBackbone(bb) }
    const bb2 = fuseP2 > 0
    if (bb2 !== lastBb2Ref.current) { lastBb2Ref.current = bb2; setShowBackbone2(bb2) }

    // Track sep progress for AnimatedBond
    if (sepP !== lastSepRef.current) { lastSepRef.current = sepP; setSepBondP(sepP) }
    if (sepP2 !== lastSep2Ref.current) { lastSep2Ref.current = sepP2; setSepBondP2(sepP2) }

    // Template shift (round 1)
    if (templateRef.current) {
      const shift = phase2Done ? -1.5 : sepP > 0 ? -1.5 * sepP : 0
      templateRef.current.position.x = shift
    }

    // Round 1 NTP positions
    for (let i = 0; i < 6; i++) {
      const rb = rbRefs.current[i]
      const pa = paRefs.current[i]
      const bs = bsRefs.current[i]
      if (!rb || !pa || !bs) continue

      if (sepP > 0 || phase2Done) {
        const t = phase2Done ? 1 : sepP
        rb.position.lerpVectors(new THREE.Vector3().copy(NTP_DOCK[i]).add(DOCK_RB_OFF), FINAL_RB[i], t)
        pa.position.lerpVectors(new THREE.Vector3().copy(NTP_DOCK[i]).add(DOCK_PA_OFF), FINAL_PA[i], t)
        bs.position.lerpVectors(NTP_DOCK[i], FINAL_BS[i], t)
      } else if (phase1Done || phase === 1) {
        const ntpP = phase1Done ? 1 : easeQuad(Math.min(Math.max((raw - i * 0.8) / 2.0, 0), 1))
        rb.position.lerpVectors(rbStart[i], new THREE.Vector3().copy(NTP_DOCK[i]).add(DOCK_RB_OFF), ntpP)
        pa.position.lerpVectors(paStart[i], new THREE.Vector3().copy(NTP_DOCK[i]).add(DOCK_PA_OFF), ntpP)
        bs.position.lerpVectors(bsStart[i], NTP_DOCK[i], ntpP)
      } else {
        rb.position.copy(rbStart[i])
        pa.position.copy(paStart[i])
        bs.position.copy(bsStart[i])
      }
    }

    // Round 1 PPi positions
    for (let i = 0; i < 6; i++) {
      const ppi = ppiRefs.current[i]
      if (!ppi) continue

      if (fuseP > 0 || phase1Done) {
        const t = phase1Done ? 1 : fuseP
        const dockWithOffset = new THREE.Vector3().copy(NTP_DOCK[i]).add(DOCK_PPI_OFF)
        ppi.position.lerpVectors(dockWithOffset, ppiRandom[i], t)
      } else if (phase === 1) {
        const ntpP = easeQuad(Math.min(Math.max((raw - i * 0.8) / 2.0, 0), 1))
        const dockWithOffset = new THREE.Vector3().copy(NTP_DOCK[i]).add(DOCK_PPI_OFF)
        ppi.position.lerpVectors(ppiStart[i], dockWithOffset, ntpP)
      } else {
        ppi.position.copy(ppiStart[i])
      }
    }

    // Round 2 NTP positions
    for (let i = 0; i < 6; i++) {
      const rb = rb2Refs.current[i]
      const pa = pa2Refs.current[i]
      const bs = bs2Refs.current[i]
      if (!rb || !pa || !bs) continue

      if (sepP2 > 0 || phase4Done) {
        const t = phase4Done ? 1 : sepP2
        rb.position.lerpVectors(new THREE.Vector3().copy(NTP2_DOCK[i]).add(DOCK_RB_OFF), FINAL2_RB[i], t)
        pa.position.lerpVectors(new THREE.Vector3().copy(NTP2_DOCK[i]).add(DOCK_PA_OFF), FINAL2_PA[i], t)
        bs.position.lerpVectors(NTP2_DOCK[i], FINAL2_BS[i], t)
      } else if (phase3Done || phase === 3) {
        const ntpP = phase3Done ? 1 : easeQuad(Math.min(Math.max((raw - i * 0.8) / 2.0, 0), 1))
        rb.position.lerpVectors(rb2Start[i], new THREE.Vector3().copy(NTP2_DOCK[i]).add(DOCK_RB_OFF), ntpP)
        pa.position.lerpVectors(pa2Start[i], new THREE.Vector3().copy(NTP2_DOCK[i]).add(DOCK_PA_OFF), ntpP)
        bs.position.lerpVectors(bs2Start[i], NTP2_DOCK[i], ntpP)
      } else {
        rb.position.copy(rb2Start[i])
        pa.position.copy(pa2Start[i])
        bs.position.copy(bs2Start[i])
      }
    }

    // Round 2 PPi positions
    for (let i = 0; i < 6; i++) {
      const ppi = ppi2Refs.current[i]
      if (!ppi) continue

      if (fuseP2 > 0 || phase3Done) {
        const t = phase3Done ? 1 : fuseP2
        const dockWithOffset = new THREE.Vector3().copy(NTP2_DOCK[i]).add(DOCK_PPI_OFF)
        ppi.position.lerpVectors(dockWithOffset, ppi2Random[i], t)
      } else if (phase === 3) {
        const ntpP = easeQuad(Math.min(Math.max((raw - i * 0.8) / 2.0, 0), 1))
        const dockWithOffset = new THREE.Vector3().copy(NTP2_DOCK[i]).add(DOCK_PPI_OFF)
        ppi.position.lerpVectors(ppi2Start[i], dockWithOffset, ntpP)
      } else {
        ppi.position.copy(ppi2Start[i])
      }
    }

    // Phase completion checks
    const p1Ready = phase === 1 && raw >= 9.5
    const p2Ready = phase === 2 && raw >= 4.0
    const p3Ready = phase === 3 && raw >= 9.5
    const p4Ready = phase === 4 && raw >= 4.0
    if (p1Ready || p2Ready || p3Ready || p4Ready) {
      running.current = false
      if (phase === 1) onPhase1Complete()
      else if (phase === 2) onPhase2Complete()
      else if (phase === 3) onPhase3Complete()
      else if (phase === 4) onPhase4Complete()
    }
  })

  const rbRef = (i: number) => (el: THREE.Group | null) => { rbRefs.current[i] = el }
  const paRef = (i: number) => (el: THREE.Group | null) => { paRefs.current[i] = el }
  const bsRef = (i: number) => (el: THREE.Group | null) => { bsRefs.current[i] = el }
  const ppiRef = (i: number) => (el: THREE.Group | null) => { ppiRefs.current[i] = el }
  const rb2Ref = (i: number) => (el: THREE.Group | null) => { rb2Refs.current[i] = el }
  const pa2Ref = (i: number) => (el: THREE.Group | null) => { pa2Refs.current[i] = el }
  const bs2Ref = (i: number) => (el: THREE.Group | null) => { bs2Refs.current[i] = el }
  const ppi2Ref = (i: number) => (el: THREE.Group | null) => { ppi2Refs.current[i] = el }

  const docked = phase1Done || phase === 1
  const separated = phase2Done || phase === 2
  const docked2 = phase3Done || phase === 3
  const separated2 = phase4Done || phase === 4
  const r2active = phase >= 3 || phase3Done || phase4Done

  return (
    <>
      <group ref={templateRef}>
        {TPL_BB.map(i => (
          <SceneOrb key={i} element={scene.orbs[i].element} detailKey={scene.orbs[i].detailKey} position={[TPL_POS[i].x, TPL_POS[i].y, TPL_POS[i].z]} onClick={onOrbClick} />
        ))}
        {TPL_BS.map(i => (
          <SceneOrb key={i} element={scene.orbs[i].element} detailKey={scene.orbs[i].detailKey} position={[TPL_POS[i].x, TPL_POS[i].y, TPL_POS[i].z]} onClick={onOrbClick} />
        ))}
        {TPL_BB.slice(0, -1).map((_, i) => (
          <PhosphodiesterBond key={`tbb${i}`} start={TPL_POS[i]} end={TPL_POS[i + 1]} type={1} progress={1} />
        ))}
        {[0, 2, 4, 6, 8, 10].map((ri, i) => (
          <PhosphodiesterBond key={`tbr${i}`} start={TPL_POS[ri]} end={TPL_POS[11 + i]} type={1} progress={1} />
        ))}
        <PhosphodiesterBond start={TPL_POS[11]} end={TPL_POS[14]} type={2} progress={1} />
        <PhosphodiesterBond start={TPL_POS[12]} end={TPL_POS[13]} type={2} progress={1} />
      </group>

      {/* Round 1 NTP groups */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`rb${i}`} ref={rbRef(i)}>
          <SceneOrb element="Ribose" detailKey="Ribose" position={[0, 0, 0]} onClick={onOrbClick} />
        </group>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`pa${i}`} ref={paRef(i)}>
          <SceneOrb element="Pi" detailKey="Pi" position={[0, 0, 0]} onClick={onOrbClick} />
        </group>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`bs${i}`} ref={bsRef(i)}>
          <SceneOrb element={NTP_BS_ELEMENTS[i]} detailKey={NTP_BS_ELEMENTS[i]} position={[0, 0, 0]} onClick={onOrbClick} />
        </group>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`ppi${i}`} ref={ppiRef(i)}>
          <SceneOrb element="Pi" detailKey="Pi" position={[PPi_LOCAL_B.x, PPi_LOCAL_B.y, PPi_LOCAL_B.z]} onClick={onOrbClick} />
          <SceneOrb element="Pi" detailKey="Pi" position={[PPi_LOCAL_C.x, PPi_LOCAL_C.y, PPi_LOCAL_C.z]} onClick={onOrbClick} />
          <PhosphodiesterBond start={[PPi_LOCAL_B.x, PPi_LOCAL_B.y, PPi_LOCAL_B.z]} end={[PPi_LOCAL_C.x, PPi_LOCAL_C.y, PPi_LOCAL_C.z]} type={1} progress={1} />
        </group>
      ))}

      {phase2Done && (<>
        {/* Round 2 NTP groups */}
        {Array.from({ length: 6 }).map((_, i) => (
        <group key={`rb2${i}`} ref={rb2Ref(i)}>
          <SceneOrb element="Ribose" detailKey="Ribose" position={[0, 0, 0]} onClick={onOrbClick} />
        </group>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`pa2${i}`} ref={pa2Ref(i)}>
          <SceneOrb element="Pi" detailKey="Pi" position={[0, 0, 0]} onClick={onOrbClick} />
        </group>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`bs2${i}`} ref={bs2Ref(i)}>
          <SceneOrb element={NTP2_BS_ELEMENTS[i]} detailKey={NTP2_BS_ELEMENTS[i]} position={[0, 0, 0]} onClick={onOrbClick} />
        </group>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`ppi2${i}`} ref={ppi2Ref(i)}>
          <SceneOrb element="Pi" detailKey="Pi" position={[PPi_LOCAL_B.x, PPi_LOCAL_B.y, PPi_LOCAL_B.z]} onClick={onOrbClick} />
          <SceneOrb element="Pi" detailKey="Pi" position={[PPi_LOCAL_C.x, PPi_LOCAL_C.y, PPi_LOCAL_C.z]} onClick={onOrbClick} />
          <PhosphodiesterBond start={[PPi_LOCAL_B.x, PPi_LOCAL_B.y, PPi_LOCAL_B.z]} end={[PPi_LOCAL_C.x, PPi_LOCAL_C.y, PPi_LOCAL_C.z]} type={1} progress={1} />
        </group>
      ))}
      </>)}
      {SOUP_IX.map((_, i) => (
        <SceneOrb key={`soup${i}`} element={scene.orbs[SOUP_IX[i]].element} detailKey={scene.orbs[SOUP_IX[i]].detailKey} position={soupPos[i]} onClick={onOrbClick} drifting />
      ))}

      {/* Round 1 start bonds */}
      {!docked && !separated && Array.from({ length: 6 }).map((_, i) => {
        const c = centers[i]
        const rb = new THREE.Vector3(c.x, c.y + 0.5, c.z)
        const pa = new THREE.Vector3(c.x + 0.5, c.y - 0.35, c.z + 0.3)
        const bs = new THREE.Vector3(c.x - 0.6, c.y - 0.2, c.z)
        const ppi = new THREE.Vector3(c.x, c.y + 0.35, c.z + 0.7)
        const pb = ppi.clone().add(PPi_LOCAL_B)
        return (<>
          <PhosphodiesterBond key={`srbpa${i}`} start={rb} end={pa} type={1} progress={1} />
          <PhosphodiesterBond key={`srbbs${i}`} start={rb} end={bs} type={1} progress={1} />
          <PhosphodiesterBond key={`spab${i}`} start={pa} end={pb} type={1} progress={1} />
        </>)
      })}

      {/* Round 2 start bonds */}
      {phase2Done && !docked2 && !separated2 && Array.from({ length: 6 }).map((_, i) => {
        const c = centers2[i]
        const rb = new THREE.Vector3(c.x, c.y + 0.5, c.z)
        const pa = new THREE.Vector3(c.x + 0.5, c.y - 0.35, c.z + 0.3)
        const bs = new THREE.Vector3(c.x - 0.6, c.y - 0.2, c.z)
        const ppi = new THREE.Vector3(c.x, c.y + 0.35, c.z + 0.7)
        const pb = ppi.clone().add(PPi_LOCAL_B)
        return (<>
          <PhosphodiesterBond key={`s2rbpa${i}`} start={rb} end={pa} type={1} progress={1} />
          <PhosphodiesterBond key={`s2rbbs${i}`} start={rb} end={bs} type={1} progress={1} />
          <PhosphodiesterBond key={`s2pab${i}`} start={pa} end={pb} type={1} progress={1} />
        </>)
      })}

      {/* Round 1 fuse bonds (PiA↔PiB at dock) */}
      {docked && !showBackbone && !separated && (
        <>
          {NTP_DOCK.map((p, i) => {
            const pa = new THREE.Vector3().copy(p).add(DOCK_PA_OFF)
            const ppi = new THREE.Vector3().copy(p).add(DOCK_PPI_OFF)
            const pb = ppi.clone().add(PPi_LOCAL_B)
            return (
              <PhosphodiesterBond key={`pab${i}`} start={pa} end={pb} type={1} progress={1} />
            )
          })}
          {NTP_DOCK.map((bsPos, i) => (
            <PhosphodiesterBond key={`pb${i}`} start={bsPos} end={TPL_POS[11 + i]} type={2} progress={1} />
          ))}
        </>
      )}

      {/* Round 1 backbone bonds (at dock, after PPi release) */}
      {docked && showBackbone && !separated && (
        <>
          {NTP_DOCK.map((p, i) => {
            const rb = new THREE.Vector3().copy(p).add(DOCK_RB_OFF)
            const pa = new THREE.Vector3().copy(p).add(DOCK_PA_OFF)
            return (
              <PhosphodiesterBond key={`lrbpa${i}`} start={rb} end={pa} type={1} progress={1} />
            )
          })}
          {NTP_DOCK.map((p, i) => {
            const rb = new THREE.Vector3().copy(p).add(DOCK_RB_OFF)
            const bs = p
            return (
              <PhosphodiesterBond key={`lrbbs${i}`} start={rb} end={bs} type={1} progress={1} />
            )
          })}
          {NTP_DOCK.slice(0, -1).map((p, i) => {
            const pa = new THREE.Vector3().copy(p).add(DOCK_PA_OFF)
            const nextRb = new THREE.Vector3().copy(NTP_DOCK[i + 1]).add(DOCK_RB_OFF)
            return (
              <PhosphodiesterBond key={`lback${i}`} start={pa} end={nextRb} type={1} progress={1} />
            )
          })}
          {NTP_DOCK.map((bsPos, i) => (
            <PhosphodiesterBond key={`pb${i}`} start={bsPos} end={TPL_POS[11 + i]} type={2} progress={1} />
          ))}
        </>
      )}

      {/* Round 1 copy bonds following orbs during separation */}
      {phase1Done && separated && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <AnimatedBond key={`arbpa${i}`} startRef={rbRefs.current[i]?.position ?? new THREE.Vector3()} endRef={paRefs.current[i]?.position ?? new THREE.Vector3()} type={1} />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <AnimatedBond key={`aback${i}`} startRef={paRefs.current[i]?.position ?? new THREE.Vector3()} endRef={rbRefs.current[i + 1]?.position ?? new THREE.Vector3()} type={1} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <AnimatedBond key={`arbbs${i}`} startRef={rbRefs.current[i]?.position ?? new THREE.Vector3()} endRef={bsRefs.current[i]?.position ?? new THREE.Vector3()} type={1} />
          ))}
        </>
      )}

      {/* Copy1 internal base pairs (visible after round 1 sep, hidden during round 2) */}
      {phase2Done && !r2active && (
        <>
          <PhosphodiesterBond start={FINAL_BS[0]} end={FINAL_BS[3]} type={2} progress={1} />
          <PhosphodiesterBond start={FINAL_BS[1]} end={FINAL_BS[2]} type={2} progress={1} />
        </>
      )}

      {/* Round 2 fuse bonds */}
      {docked2 && !showBackbone2 && !separated2 && (
        <>
          {NTP2_DOCK.map((p, i) => {
            const pa = new THREE.Vector3().copy(p).add(DOCK_PA_OFF)
            const ppi = new THREE.Vector3().copy(p).add(DOCK_PPI_OFF)
            const pb = ppi.clone().add(PPi_LOCAL_B)
            return (
              <PhosphodiesterBond key={`pab2${i}`} start={pa} end={pb} type={1} progress={1} />
            )
          })}
          {NTP2_DOCK.map((bsPos, i) => (
            <PhosphodiesterBond key={`pb2${i}`} start={bsPos} end={FINAL_BS[i]} type={2} progress={1} />
          ))}
        </>
      )}

      {/* Round 2 backbone bonds (at dock) */}
      {docked2 && showBackbone2 && !separated2 && (
        <>
          {NTP2_DOCK.map((p, i) => {
            const rb = new THREE.Vector3().copy(p).add(DOCK_RB_OFF)
            const pa = new THREE.Vector3().copy(p).add(DOCK_PA_OFF)
            return (
              <PhosphodiesterBond key={`lrbpa2${i}`} start={rb} end={pa} type={1} progress={1} />
            )
          })}
          {NTP2_DOCK.map((p, i) => {
            const rb = new THREE.Vector3().copy(p).add(DOCK_RB_OFF)
            const bs = p
            return (
              <PhosphodiesterBond key={`lrbbs2${i}`} start={rb} end={bs} type={1} progress={1} />
            )
          })}
          {NTP2_DOCK.slice(0, -1).map((p, i) => {
            const pa = new THREE.Vector3().copy(p).add(DOCK_PA_OFF)
            const nextRb = new THREE.Vector3().copy(NTP2_DOCK[i + 1]).add(DOCK_RB_OFF)
            return (
              <PhosphodiesterBond key={`lback2${i}`} start={pa} end={nextRb} type={1} progress={1} />
            )
          })}
          {NTP2_DOCK.map((bsPos, i) => (
            <PhosphodiesterBond key={`pb2${i}`} start={bsPos} end={FINAL_BS[i]} type={2} progress={1} />
          ))}
        </>
      )}

      {/* Round 2 copy bonds following orbs during separation */}
      {phase3Done && separated2 && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <AnimatedBond key={`a2rbpa${i}`} startRef={rb2Refs.current[i]?.position ?? new THREE.Vector3()} endRef={pa2Refs.current[i]?.position ?? new THREE.Vector3()} type={1} />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <AnimatedBond key={`a2back${i}`} startRef={pa2Refs.current[i]?.position ?? new THREE.Vector3()} endRef={rb2Refs.current[i + 1]?.position ?? new THREE.Vector3()} type={1} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <AnimatedBond key={`a2rbbs${i}`} startRef={rb2Refs.current[i]?.position ?? new THREE.Vector3()} endRef={bs2Refs.current[i]?.position ?? new THREE.Vector3()} type={1} />
          ))}
          <AnimatedBond
            startRef={bs2Refs.current[0]?.position ?? new THREE.Vector3()}
            endRef={bs2Refs.current[3]?.position ?? new THREE.Vector3()}
            type={2}
            progress={sepBondP2}
          />
          <AnimatedBond
            startRef={bs2Refs.current[1]?.position ?? new THREE.Vector3()}
            endRef={bs2Refs.current[2]?.position ?? new THREE.Vector3()}
            type={2}
            progress={sepBondP2}
          />
        </>
      )}
    </>
  )
}
