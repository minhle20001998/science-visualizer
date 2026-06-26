import { useMemo } from 'react'
import * as THREE from 'three'

export function SharedElectronPair({
  start,
  end,
  bondType,
}: {
  start: THREE.Vector3
  end: THREE.Vector3
  bondType: 1 | 2 | 3
}) {
  const positions = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(end, start)
    const norm = dir.clone().normalize()
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)

    const ref = Math.abs(norm.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
    const perp = new THREE.Vector3().crossVectors(norm, ref).normalize()

    const result: THREE.Vector3[] = []

    if (bondType === 1) {
      result.push(mid.clone())
    } else if (bondType === 2) {
      const off = 0.08
      result.push(
        mid.clone().add(perp.clone().multiplyScalar(-off)),
        mid.clone().add(perp.clone().multiplyScalar(off)),
      )
    } else {
      const off = 0.08 * 1.5
      result.push(
        mid.clone().add(perp.clone().multiplyScalar(-off)),
        mid.clone(),
        mid.clone().add(perp.clone().multiplyScalar(off)),
      )
    }
    return result
  }, [start, end, bondType])

  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshBasicMaterial color="#4af0ff" transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}
