import { useMemo, useRef } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ORB_COLORS: Record<string, string> = {
  A: '#4af0ff',
  U: '#ff6b6b',
  G: '#66dd88',
  C: '#ffd93d',
  H2O: '#5b8def',
  CH4: '#ff8000',
  NH3: '#a66cff',
  H2: '#cccccc',
  CO2: '#888888',
  HCN: '#4af0ff',
  N2: '#5b8def',
  H2S: '#ffd93d',
  Pi: '#ff6b6b',
  Ribose: '#ff9f6b',
  Phospholipid: '#ff8a9e',
  'Fatty-tail': '#d4a574',
  Alveolus: '#e8c8a0',
  O2: '#00d4ff',
  Capillary: '#c8a8f0',
  RBC: '#c04040',
}

const DARK_THRESHOLD = 0.3

function isDark(hex: string): boolean {
  const c = new THREE.Color(hex)
  const l = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b
  return l < DARK_THRESHOLD
}

export function SceneOrb({
  element,
  detailKey,
  position,
  drifting,
  onClick,
  colorOverride,
  hideLabel,
  labelText,
}: {
  element: string
  detailKey: string
  position: [number, number, number]
  drifting?: boolean
  onClick: (detailKey: string) => void
  colorOverride?: string
  hideLabel?: boolean
  labelText?: string
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const color = useMemo(() => colorOverride ?? ORB_COLORS[element] ?? '#888888', [element, colorOverride])
  const colorIsDark = useMemo(() => isDark(color), [color])
  const basePos = useRef(new THREE.Vector3(...position))
  const phase = useRef(Math.random() * Math.PI * 2)

  useFrame((state) => {
    if (!drifting) return
    const t = state.clock.elapsedTime
    const x = Math.sin(t * 0.3 + phase.current) * 0.2
    const y = Math.cos(t * 0.2 + phase.current * 1.3) * 0.2
    const z = Math.sin(t * 0.25 + phase.current * 0.7) * 0.2
    groupRef.current.position.set(
      basePos.current.x + x,
      basePos.current.y + y,
      basePos.current.z + z
    )
  })

  return (
    <group ref={groupRef} position={position}>
      {colorIsDark && (
        <mesh>
          <sphereGeometry args={[0.35 * 1.35, 24, 24]} />
          <meshBasicMaterial
            color="#6677cc"
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </mesh>
      )}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onClick(detailKey)
        }}
        onPointerEnter={() => { document.body.style.cursor = 'pointer' }}
        onPointerLeave={() => { document.body.style.cursor = 'default' }}
      >
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.1}
          emissive={color}
          emissiveIntensity={colorIsDark ? 0.2 : 0.0}
        />
      </mesh>
      {!hideLabel && (
        <Text
          position={[0, 0.55, 0]}
          fontSize={0.22}
          color={colorIsDark ? '#aaaacc' : '#cccccc'}
          fontWeight={700}
          anchorX="center"
          anchorY="middle"
        >
          {labelText ?? element}
        </Text>
      )}
    </group>
  )
}
