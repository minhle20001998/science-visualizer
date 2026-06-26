import { useMemo } from 'react'
import { getOrbitalGeometry, getOrbitalColor, getOrbitalMValues } from '../algorithms/orbitalGeometry'

export function OrbitalShell({
  shape,
  radius,
  axisIndex,
  dimmed = false,
}: {
  shape: string
  radius: number
  axisIndex: number
  dimmed?: boolean
}) {
  const l = shape === 's' ? 0 : shape === 'p' ? 1 : shape === 'd' ? 2 : 3
  const mValues = getOrbitalMValues(l)
  const m = mValues[axisIndex % mValues.length] ?? 0

  const geometry = useMemo(
    () => getOrbitalGeometry(l, m, radius),
    [l, m, radius]
  )

  const color = getOrbitalColor(l)

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={dimmed ? 0.004 : 0.08}
        wireframe
        depthWrite={false}
      />
    </mesh>
  )
}
