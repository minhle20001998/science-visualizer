import { useMemo } from 'react'
import { resolveVSEPR, getValence, getUsedSlots, getCpkColor } from '../../../algorithms/bondEngine'
import type { PlacedAtom, BuilderBond } from '../../../algorithms/bondEngine'

export function GhostBond({
  atom,
  bonds,
}: {
  atom: PlacedAtom
  bonds: BuilderBond[]
}) {
  const valence = getValence(atom.element)
  const used = getUsedSlots(atom.id, bonds)
  const freeSlots = valence - used
  const color = getCpkColor(atom.element)

  const positions = useMemo(() => {
    const dirs = resolveVSEPR(freeSlots)
    return dirs.slice(0, freeSlots).map(d => [
      d[0] * 0.6,
      d[1] * 0.6 + 0.35,
      d[2] * 0.6,
    ] as [number, number, number])
  }, [freeSlots])

  if (freeSlots <= 0) return null

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={[pos[0], pos[1], pos[2]]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  )
}
