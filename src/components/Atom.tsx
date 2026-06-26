import { useMemo } from 'react'
import { getElectronConfig } from '../algorithms/electronConfig'
import { assignElectrons } from '../algorithms/orbitalPaths'
import { Nucleus } from './Nucleus'
import { Electron } from './Electron'
import { OrbitalShell } from './OrbitalShell'
import { useStore } from '../store/useStore'

function highlightKey(label: string, shape: string, axisIndex: number): string {
  if (shape === 's') return label
  return `${label}_${axisIndex}`
}

function formatOrbitalLabel(assignment: {
  shape: string
  label: string
  axisIndex: number
}): string {
  if (assignment.shape === 's') return assignment.label
  if (assignment.shape === 'p') {
    const axes = ['pₓ', 'pᵧ', 'p_z']
    return `${assignment.label} ${axes[assignment.axisIndex]}`
  }
  if (assignment.shape === 'd') {
    const axes = ['d_z²', 'd_xz', 'd_yz', 'd_xy', 'd_x²-y²']
    return `${assignment.label} ${axes[assignment.axisIndex]}`
  }
  return assignment.label
}

export function Atom({ atomicNumber }: { atomicNumber: number }) {
  const speed = useStore((s) => s.speed)
  const showOrbitals = useStore((s) => s.showOrbitals)
  const highlightedOrbitals = useStore((s) => s.highlightedOrbitals)
  const selectElectron = useStore((s) => s.selectElectron)

  const config = useMemo(() => getElectronConfig(atomicNumber), [atomicNumber])

  const electrons = useMemo(() => assignElectrons(config), [config])

  const nucleusGlowRadius = useMemo(() => {
    const total = atomicNumber + Math.round(atomicNumber * 1.2) + 2
    return (Math.cbrt(total) * 0.2 + 0.15) * 1.1
  }, [atomicNumber])

  const orbitalShells = useMemo(() => {
    const seen = new Set<string>()
    return electrons.filter((e) => {
      const key = `${e.label}_ax${e.axisIndex}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [electrons])

  return (
    <group>
      <Nucleus atomicNumber={atomicNumber} />

      {showOrbitals &&
        orbitalShells.map((e) => (
          <OrbitalShell
            key={`${e.label}_ax${e.axisIndex}`}
            shape={e.shape}
            radius={e.radius}
            axisIndex={e.axisIndex}
            dimmed={highlightedOrbitals.length > 0 && !highlightedOrbitals.includes(highlightKey(e.label, e.shape, e.axisIndex))}
          />
        ))}

      {electrons.map((e) => (
        <Electron
          key={e.id}
          assignment={e}
          speed={speed}
          minRadius={nucleusGlowRadius}
          highlighted={highlightedOrbitals.length === 0 || highlightedOrbitals.includes(highlightKey(e.label, e.shape, e.axisIndex))}
          onClick={() =>
            selectElectron({
              index: e.id,
              label: formatOrbitalLabel(e),
              spin: e.spin,
            })
          }
        />
      ))}
    </group>
  )
}
