import { useMemo } from 'react'
import { buildMolecule3D, getVdwRadius, type GeometryType } from '../../algorithms/moleculeGeometry'
import { MoleculeAtom } from './MoleculeAtom'
import { Bond } from './Bond'
import { SharedElectronPair } from './SharedElectronPair'

export function Molecule({
  elements,
  bonds,
  geometry,
  spaceFill,
  showElectrons,
}: {
  elements: { element: string; label: string; parentIndex?: number }[]
  bonds: { from: number; to: number; type: 1 | 2 | 3 }[]
  geometry: GeometryType
  spaceFill: boolean
  showElectrons: boolean
}) {
  const mol = useMemo(() => {
    const bl = spaceFill
      ? bonds.reduce((sum, b) => {
          const r1 = getVdwRadius(elements[b.from].element)
          const r2 = getVdwRadius(elements[b.to].element)
          return sum + (r1 + r2)
        }, 0) / bonds.length
      : undefined
    return buildMolecule3D(geometry, elements, bonds, bl)
  }, [geometry, elements, bonds, spaceFill])

  const center = mol.center

  return (
    <group position={center.clone().negate()}>
      {mol.atoms.map((a, i) => (
        <MoleculeAtom key={i} atom={a} spaceFill={spaceFill} />
      ))}
      {!spaceFill &&
        mol.bonds.map((b, i) => (
          <Bond
            key={i}
            start={mol.atoms[b.from].position}
            end={mol.atoms[b.to].position}
            bondType={b.type}
          />
        ))}
      {!spaceFill && showElectrons &&
        mol.bonds.map((b, i) => (
          <SharedElectronPair
            key={i}
            start={mol.atoms[b.from].position}
            end={mol.atoms[b.to].position}
            bondType={b.type}
          />
        ))}
    </group>
  )
}
