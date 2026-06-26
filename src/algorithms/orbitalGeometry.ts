import * as THREE from 'three'

type HarmonicFn = (theta: number, phi: number) => number

const CACHE = new Map<string, THREE.BufferGeometry>()

function sphericalHarmonic(l: number, m: number, theta: number, phi: number): number {
  const ct = Math.cos(theta)
  const st = Math.sin(theta)
  const cp = Math.cos(phi)
  const sp = Math.sin(phi)

  if (l === 0) return 0.5 * Math.sqrt(1 / Math.PI)

  if (l === 1) {
    if (m === 0) return 0.5 * Math.sqrt(3 / Math.PI) * ct
    if (m === 1) return 0.5 * Math.sqrt(3 / Math.PI) * st * cp
    if (m === -1) return 0.5 * Math.sqrt(3 / Math.PI) * st * sp
  }

  if (l === 2) {
    if (m === 0) return 0.25 * Math.sqrt(5 / Math.PI) * (3 * ct * ct - 1)
    if (m === 1) return 0.5 * Math.sqrt(15 / Math.PI) * st * ct * cp
    if (m === -1) return 0.5 * Math.sqrt(15 / Math.PI) * st * ct * sp
    if (m === 2) return 0.25 * Math.sqrt(15 / Math.PI) * st * st * Math.cos(2 * phi)
    if (m === -2) return 0.25 * Math.sqrt(15 / Math.PI) * st * st * Math.sin(2 * phi)
  }

  if (l === 3) {
    const ct2 = ct * ct
    if (m === 0) return 0.25 * Math.sqrt(7 / Math.PI) * (5 * ct2 - 3) * ct
    if (m === 1) return 0.25 * Math.sqrt(21 / (2 * Math.PI)) * st * (5 * ct2 - 1) * cp
    if (m === -1) return 0.25 * Math.sqrt(21 / (2 * Math.PI)) * st * (5 * ct2 - 1) * sp
    if (m === 2) return 0.25 * Math.sqrt(105 / Math.PI) * st * st * ct * Math.cos(2 * phi)
    if (m === -2) return 0.25 * Math.sqrt(105 / Math.PI) * st * st * ct * Math.sin(2 * phi)
    if (m === 3) return 0.25 * Math.sqrt(35 / (2 * Math.PI)) * st * st * st * Math.cos(3 * phi)
    if (m === -3) return 0.25 * Math.sqrt(35 / (2 * Math.PI)) * st * st * st * Math.sin(3 * phi)
  }

  return 0
}

function getHarmonic(l: number, m: number): HarmonicFn {
  return (theta: number, phi: number) => sphericalHarmonic(l, m, theta, phi)
}

function findMaxAbs(harmonic: HarmonicFn, steps: number): number {
  let maxVal = 0
  for (let i = 0; i < steps; i++) {
    const theta = (i / steps) * Math.PI
    for (let j = 0; j < steps; j++) {
      const phi = (j / steps) * Math.PI * 2
      maxVal = Math.max(maxVal, Math.abs(harmonic(theta, phi)))
    }
  }
  return maxVal || 1
}

export function getOrbitalGeometry(l: number, m: number, radius: number): THREE.BufferGeometry {
  const key = `l${l}m${m}r${radius.toFixed(1)}`
  const cached = CACHE.get(key)
  if (cached) return cached

  const harmonic = getHarmonic(l, m)
  const maxAbs = findMaxAbs(harmonic, 64)
  const detail = 48
  const geo = new THREE.SphereGeometry(1, detail, detail)
  const pos = geo.attributes.position.array as Float32Array

  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i], y = pos[i + 1], z = pos[i + 2]
    const r = Math.sqrt(x * x + y * y + z * z)
    if (r < 0.001) continue

    const theta = Math.acos(Math.max(-1, Math.min(1, z / r)))
    const phi = Math.atan2(y, x)

    const val = harmonic(theta, phi)
    const scale = 0.15 + 0.85 * (Math.abs(val) / maxAbs)
    const newR = radius * scale

    pos[i] = (x / r) * newR
    pos[i + 1] = (y / r) * newR
    pos[i + 2] = (z / r) * newR
  }

  geo.computeVertexNormals()
  CACHE.set(key, geo)
  return geo
}

export function getOrbitalColor(l: number): string {
  if (l === 0) return '#4a9eff'
  if (l === 1) return '#ff6b6b'
  if (l === 2) return '#ffd93d'
  return '#a66cff'
}

export function getOrbitalMValues(l: number): number[] {
  if (l === 0) return [0]
  if (l === 1) return [0, 1, -1]
  if (l === 2) return [0, 1, -1, 2, -2]
  return [0, 1, -1, 2, -2, 3, -3]
}
