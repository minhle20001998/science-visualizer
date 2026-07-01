import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const geoCache = new Map<string, THREE.CylinderGeometry>()

function getGeometry(radius: number, length: number): THREE.CylinderGeometry {
  const key = `${radius}-${length.toFixed(4)}`
  let g = geoCache.get(key)
  if (!g) {
    g = new THREE.CylinderGeometry(radius, radius, length, 8)
    geoCache.set(key, g)
  }
  return g
}

export function PhosphodiesterBond({
  start,
  end,
  type = 1,
  progress = 1,
}: {
  start: [number, number, number] | THREE.Vector3
  end: [number, number, number] | THREE.Vector3
  type?: 1 | 2
  progress?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const s = useMemo(() => (start instanceof THREE.Vector3 ? start : new THREE.Vector3(...start)), [start])
  const e = useMemo(() => (end instanceof THREE.Vector3 ? end : new THREE.Vector3(...end)), [end])

  const { midpoint, direction, length } = useMemo(() => {
    const dir = new THREE.Vector3().copy(e).sub(s)
    const len = dir.length()
    const mid = new THREE.Vector3().copy(s).add(dir.clone().multiplyScalar(0.5))
    return { midpoint: mid, direction: dir.normalize(), length: len }
  }, [s, e])

  const quat = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
    return q
  }, [direction])

  const radius = type === 2 ? 0.025 : 0.04
  const color = type === 2 ? '#88ddff' : '#ff9900'
  const baseOpacity = type === 2 ? 0.5 : 1
  const geometry = getGeometry(radius, length)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.y = progress
    }
  })

  return (
    <mesh ref={meshRef} position={midpoint} quaternion={quat} geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent={baseOpacity < 1 || progress < 1}
        opacity={baseOpacity * Math.min(progress * 2, 1)}
      />
    </mesh>
  )
}
