import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import { Mesh } from 'three'
import { getElectronPosition, type ElectronAssignment } from '../algorithms/orbitalPaths'

export function Electron({
  assignment,
  speed,
  minRadius,
  highlighted,
  onClick,
}: {
  assignment: ElectronAssignment
  speed: number
  minRadius: number
  highlighted: boolean
  onClick?: () => void
}) {
  const meshRef = useRef<Mesh>(null)
  const timeRef = useRef(Math.random() * 100)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    timeRef.current += delta * speed * 150
    const pos = getElectronPosition(assignment, timeRef.current, minRadius)
    meshRef.current.position.copy(pos)
  })

  const size = 0.08 + (assignment.n > 4 ? 0.06 : assignment.n > 2 ? 0.07 : 0.08)

  return (
    <Sphere
      ref={meshRef}
      args={[size, 12, 12]}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshBasicMaterial
        color={hovered ? '#ffffff' : highlighted ? '#4af0ff' : '#4af0ff'}
        transparent
        opacity={highlighted ? 0.95 : 0.03}
      />
    </Sphere>
  )
}
