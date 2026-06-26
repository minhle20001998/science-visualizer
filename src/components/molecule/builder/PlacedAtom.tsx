import { useMemo, useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { getCpkColor } from '../../../algorithms/bondEngine'
import { GhostBond } from './GhostBond'
import type { BuilderBond } from '../../../algorithms/bondEngine'

const BALL_RADIUS: Record<string, number> = {
  H: 0.25, C: 0.35, N: 0.3, O: 0.3, F: 0.25,
  Cl: 0.35, Br: 0.4, I: 0.45, S: 0.35, P: 0.35,
  Na: 0.4, K: 0.45,
}

function getRadius(element: string): number {
  return BALL_RADIUS[element] ?? 0.35
}

const CLICK_DRAG_THRESHOLD = 8

const DARK_THRESHOLD = 0.3

function isColorDark(hex: string): boolean {
  const c = new THREE.Color(hex)
  const l = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b
  return l < DARK_THRESHOLD
}

export function PlacedAtom({
  id,
  element,
  position,
  isSelected,
  isInMolecule,
  bonds,
  onClick,
  onMove,
  onDragStart,
  onDragEnd,
  onDoubleClick,
}: {
  id: number
  element: string
  position: [number, number, number]
  isSelected: boolean
  isInMolecule: boolean
  bonds: BuilderBond[]
  onClick: () => void
  onMove: (pos: [number, number, number]) => void
  onDragStart: () => void
  onDragEnd: () => void
  onDoubleClick: () => void
}) {
  const [dragging, setDragging] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null!)
  const color = getCpkColor(element)
  const radius = getRadius(element)
  const darkAtom = useMemo(() => isColorDark(color), [color])
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const intersectPoint = useRef(new THREE.Vector3())
  const lastClickRef = useRef(0)
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)

  return (
    <group>
      {isInMolecule && !isSelected && (
        <mesh position={position}>
          <sphereGeometry args={[radius * 1.12, 24, 24]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.05}
            depthWrite={false}
          />
        </mesh>
      )}

      <group position={position}>
        {darkAtom && !isSelected && (
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
        <mesh
          ref={meshRef}
          onPointerDown={(e) => {
            e.stopPropagation()
            const now = Date.now()
            if (now - lastClickRef.current < 300) {
              lastClickRef.current = 0
              onDoubleClick()
              return
            }
            lastClickRef.current = now
            pointerDownPos.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
            ;(e.target as any).setPointerCapture(e.pointerId)
            setDragging(true)
            onDragStart()
          }}
          onPointerMove={(e) => {
            if (!dragging) return
            e.stopPropagation()
            const raycaster = new THREE.Raycaster()
            raycaster.setFromCamera(
              new THREE.Vector2(e.pointer.x, e.pointer.y),
              e.camera
            )
            if (raycaster.ray.intersectPlane(plane.current, intersectPoint.current)) {
              onMove([intersectPoint.current.x, intersectPoint.current.y, intersectPoint.current.z])
            }
          }}
          onPointerUp={(e) => {
            if (!dragging) return
            setDragging(false)
            ;(e.target as any).releasePointerCapture(e.pointerId)

            const wasDrag = pointerDownPos.current && (
              Math.abs(e.nativeEvent.clientX - pointerDownPos.current.x) > CLICK_DRAG_THRESHOLD ||
              Math.abs(e.nativeEvent.clientY - pointerDownPos.current.y) > CLICK_DRAG_THRESHOLD
            )

            pointerDownPos.current = null

            if (!wasDrag) {
              onClick()
            }
            onDragEnd()
          }}
        >
          <sphereGeometry args={[radius, 24, 24]} />
          <meshStandardMaterial
            color={color}
            roughness={0.3}
            metalness={0.1}
            emissive={isSelected ? color : darkAtom ? color : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : darkAtom ? 0.2 : 0}
          />
        </mesh>
        <Text
          position={[0, radius + 0.2, 0]}
          fontSize={0.18}
          color={isSelected ? color : '#cccccc'}
          fontWeight={700}
          anchorX="center"
          anchorY="middle"
        >
          {element}
        </Text>
        {isSelected && (
          <>
            <mesh>
              <sphereGeometry args={[radius * 1.15, 24, 24]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.08}
                depthWrite={false}
              />
            </mesh>
            <GhostBond
              atom={{ id, element, position }}
              bonds={bonds}
            />
          </>
        )}
      </group>
    </group>
  )
}
