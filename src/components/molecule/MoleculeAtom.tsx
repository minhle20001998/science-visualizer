import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { getBallRadius, getVdwRadius, type MolAtom } from '../../algorithms/moleculeGeometry'

const DARK_THRESHOLD = 0.3

function isDark(hex: string): boolean {
  const c = new THREE.Color(hex)
  const l = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b
  return l < DARK_THRESHOLD
}

export function MoleculeAtom({
  atom,
  spaceFill,
}: {
  atom: MolAtom
  spaceFill: boolean
}) {
  const radius = spaceFill ? getVdwRadius(atom.element) : getBallRadius(atom.element)
  const colorIsDark = useMemo(() => isDark(atom.color), [atom.color])

  return (
    <group position={atom.position}>
      {colorIsDark && !spaceFill && (
        <mesh>
          <sphereGeometry args={[radius * 1.35, 24, 24]} />
          <meshBasicMaterial
            color="#6677cc"
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </mesh>
      )}
      <mesh>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={atom.color}
          roughness={spaceFill ? 0.4 : 0.3}
          metalness={0.1}
          emissive={atom.color}
          emissiveIntensity={colorIsDark ? 0.2 : 0.0}

        />
      </mesh>
      {!spaceFill && (
        <Text
          position={[0, radius + 0.25, 0]}
          fontSize={0.2}
          color={colorIsDark ? '#aaaacc' : '#cccccc'}
          fontWeight={600}
          anchorX="center"
          anchorY="middle"
        >
          {atom.label}
        </Text>
      )}
    </group>
  )
}
