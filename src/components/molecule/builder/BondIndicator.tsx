import { useMemo } from 'react'
import * as THREE from 'three'
import { getCpkColor, getValence, getUsedSlots } from '../../../algorithms/bondEngine'
import type { PlacedAtom, BuilderBond } from '../../../algorithms/bondEngine'

const BOND_THRESHOLD = 2.5

export function BondIndicator({
  atoms,
  bonds,
}: {
  atoms: PlacedAtom[]
  bonds: BuilderBond[]
}) {
  const previewBonds = useMemo(() => {
    const result: { start: [number, number, number]; end: [number, number, number]; colorA: string; colorB: string }[] = []

    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const alreadyBonded = bonds.some(
          b => (b.from === i && b.to === j) || (b.from === j && b.to === i)
        )
        if (alreadyBonded) continue

        const a = atoms[i]
        const b = atoms[j]
        const dx = a.position[0] - b.position[0]
        const dy = a.position[1] - b.position[1]
        const dz = a.position[2] - b.position[2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (dist > BOND_THRESHOLD) continue

        const usedI = getUsedSlots(i, bonds)
        const usedJ = getUsedSlots(j, bonds)
        if (getValence(a.element) - usedI <= 0) continue
        if (getValence(b.element) - usedJ <= 0) continue

        result.push({
          start: a.position,
          end: b.position,
          colorA: getCpkColor(a.element),
          colorB: getCpkColor(b.element),
        })
      }
    }

    return result
  }, [atoms, bonds])

  return (
    <group>
      {previewBonds.map((pb, i) => {
        const s = new THREE.Vector3(...pb.start)
        const e = new THREE.Vector3(...pb.end)
        const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5)
        const dir = new THREE.Vector3().subVectors(e, s)
        const length = dir.length()
        const norm = dir.clone().normalize()
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), norm)

        return (
          <mesh key={i} position={mid} quaternion={q}>
            <cylinderGeometry args={[0.025, 0.025, length, 6]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
          </mesh>
        )
      })}
    </group>
  )
}
