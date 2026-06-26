import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'

export function Nucleus({ atomicNumber }: { atomicNumber: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const total = atomicNumber + Math.round(atomicNumber * 1.2) + 2
  const radius = Math.cbrt(total) * 0.2 + 0.15

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      <Sphere args={[radius, 24, 24]}>
        <meshStandardMaterial
          color="#e74c3c"
          emissive="#e74c3c"
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.1}
        />
      </Sphere>
      <Sphere args={[radius * 1.1, 24, 24]}>
        <meshBasicMaterial
          color="#e74c3c"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </Sphere>
    </group>
  )
}
