import { Text } from '@react-three/drei'

export function FloatingLabel({
  text,
  position,
  color = '#aaaacc',
  fontSize = 0.25,
  detailKey,
  onClick,
}: {
  text: string
  position: [number, number, number]
  color?: string
  fontSize?: number
  detailKey?: string
  onClick?: (key: string) => void
}) {
  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={color}
      fontWeight={600}
      anchorX="center"
      anchorY="middle"
      onPointerDown={detailKey && onClick ? (e) => { e.stopPropagation(); onClick(detailKey!) } : undefined}
      onPointerOver={detailKey ? () => { document.body.style.cursor = 'pointer' } : undefined}
      onPointerOut={detailKey ? () => { document.body.style.cursor = 'default' } : undefined}
    >
      {text}
    </Text>
  )
}
