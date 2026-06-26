import { useMemo } from 'react'
import * as THREE from 'three'

const AXES: { dir: [number, number, number]; color: string; label: string }[] = [
  { dir: [1, 0, 0], color: '#ff6666', label: 'X' },
  { dir: [0, 1, 0], color: '#66ff66', label: 'Y' },
  { dir: [0, 0, 1], color: '#6688ff', label: 'Z' },
]

function AxisLine({ dir, color }: { dir: [number, number, number]; color: string }) {
  const rot = useMemo(() => {
    const up = new THREE.Vector3(0, 1, 0)
    const target = new THREE.Vector3(...dir)
    const q = new THREE.Quaternion().setFromUnitVectors(up, target)
    return new THREE.Euler().setFromQuaternion(q)
  }, [dir])

  return (
    <group>
      <mesh position={[dir[0] * 5.5, dir[1] * 5.5, dir[2] * 5.5]} rotation={rot}>
        <coneGeometry args={[0.12, 0.3, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <mesh rotation={rot}>
        <cylinderGeometry args={[0.025, 0.025, 5.5, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export function AxisIndicator({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <group>
      {AXES.map((a) => (
        <AxisLine key={a.label} dir={a.dir} color={a.color} />
      ))}
    </group>
  )
}
