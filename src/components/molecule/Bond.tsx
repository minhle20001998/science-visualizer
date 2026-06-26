import { useMemo } from 'react'
import * as THREE from 'three'

export function Bond({
  start,
  end,
  bondType,
  color = 'rgba(180,180,180,0.6)',
}: {
  start: THREE.Vector3
  end: THREE.Vector3
  bondType: 1 | 2 | 3
  color?: string
}) {
  const mid = useMemo(() => new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5), [start, end])
  const dir = useMemo(() => new THREE.Vector3().subVectors(end, start), [start, end])
  const length = dir.length()
  const norm = dir.clone().normalize()

  const up = useMemo(() => {
    const ref = Math.abs(norm.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
    const perp = new THREE.Vector3().crossVectors(norm, ref).normalize()
    return perp
  }, [norm])

  const rot = useMemo(() => {
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), norm)
    return q
  }, [norm])

  if (bondType === 1) {
    return (
      <mesh position={mid} quaternion={rot}>
        <cylinderGeometry args={[0.045, 0.045, length, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    )
  }

  const offset = 0.08
  const positions: THREE.Vector3[] = []
  if (bondType === 2) {
    positions.push(up.clone().multiplyScalar(-offset), up.clone().multiplyScalar(offset))
  } else {
    positions.push(
      up.clone().multiplyScalar(-offset * 1.5),
      new THREE.Vector3(0, 0, 0),
      up.clone().multiplyScalar(offset * 1.5)
    )
  }

  return (
    <group>
      {positions.map((off, i) => (
        <mesh key={i} position={mid.clone().add(off)} quaternion={rot}>
          <cylinderGeometry args={[0.035, 0.035, length, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.45} />
        </mesh>
      ))}
    </group>
  )
}
