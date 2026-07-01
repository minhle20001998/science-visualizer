import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function FloatingBondStick({
  position,
  detailKey,
  drifting,
  onClick,
}: {
  position: [number, number, number]
  detailKey: string
  drifting?: boolean
  onClick: (key: string) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  const rotQuat = useRef(new THREE.Quaternion().setFromEuler(
    new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6)
  ))

  useFrame((state) => {
    if (!drifting || !meshRef.current) return
    const t = state.clock.elapsedTime
    const x = Math.sin(t * 0.3 + phase.current) * 0.2
    const y = Math.cos(t * 0.2 + phase.current * 1.3) * 0.2
    const z = Math.sin(t * 0.25 + phase.current * 0.7) * 0.2
    meshRef.current.position.set(
      position[0] + x,
      position[1] + y,
      position[2] + z
    )
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      quaternion={rotQuat.current}
      onClick={(e) => { e.stopPropagation(); onClick(detailKey) }}
      onPointerEnter={() => { document.body.style.cursor = 'pointer' }}
      onPointerLeave={() => { document.body.style.cursor = 'default' }}
    >
      <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
      <meshBasicMaterial color="#ff9900" />
    </mesh>
  )
}
