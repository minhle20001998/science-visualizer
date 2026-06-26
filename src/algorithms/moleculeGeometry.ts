import * as THREE from 'three'

export type GeometryType =
  | 'linear'
  | 'bent'
  | 'trigonal-planar'
  | 'tetrahedral'
  | 'trigonal-bipyramidal'
  | 'octahedral'

export interface MolAtom {
  element: string
  label: string
  color: string
  position: THREE.Vector3
}

export interface MolBond {
  from: number
  to: number
  type: 1 | 2 | 3
}

export interface Molecule3D {
  atoms: MolAtom[]
  bonds: MolBond[]
  center: THREE.Vector3
}

const CPK_COLORS: Record<string, string> = {
  H: '#ffffff',
  C: '#404040',
  N: '#3050f8',
  O: '#ff0d0d',
  F: '#90e050',
  Cl: '#1ff01f',
  Br: '#a62929',
  I: '#940094',
  S: '#ffff30',
  P: '#ff8000',
  B: '#ffe020',
  Si: '#f0c8a0',
  Fe: '#e06633',
  Cu: '#c88033',
  Na: '#ab5cf2',
  Mg: '#8aff00',
  Al: '#bfa6a6',
  K: '#8f40d4',
  Ca: '#3dff00',
  Zn: '#0aab8f',
  Xe: '#c090f0',
  BrF: '#a62929',
}

export const ELEMENT_COLORS: Record<string, string> = CPK_COLORS

const BOND_LENGTH = 1.6
const VDW_RADIUS: Record<string, number> = {
  H: 0.4, C: 0.7, N: 0.65, O: 0.6, F: 0.5,
  Cl: 0.8, Br: 0.85, I: 0.95, S: 0.8, P: 0.8,
  B: 0.7, Si: 0.9, Fe: 0.7, Cu: 0.7,
  Na: 0.9, Mg: 0.8, Al: 0.8, K: 1.0, Ca: 0.9,
  Zn: 0.7, Xe: 1.0,
  O_default: 0.6,
}

export function getVdwRadius(element: string): number {
  return VDW_RADIUS[element] ?? 0.5
}

export const BALL_RADIUS: Record<string, number> = {
  H: 0.3, C: 0.45, N: 0.4, O: 0.4, F: 0.35,
  Cl: 0.5, Br: 0.55, I: 0.6, S: 0.5, P: 0.5,
  B: 0.45, Si: 0.5, Fe: 0.5, Cu: 0.5,
  Na: 0.5, Mg: 0.45, Al: 0.45, K: 0.55, Ca: 0.5,
  Zn: 0.45, Xe: 0.6,
}

export function getBallRadius(element: string): number {
  return BALL_RADIUS[element] ?? 0.4
}

function vec(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, z)
}

function normalizeAngle(deg: number): number {
  return (deg * Math.PI) / 180
}

function generatePositions(
  geometry: GeometryType,
  atomCount: number,
  bondLength: number
): THREE.Vector3[] {
  const L = bondLength

  switch (geometry) {
    case 'linear': {
      if (atomCount === 2) return [vec(-L / 2, 0, 0), vec(L / 2, 0, 0)]
      const positions: THREE.Vector3[] = [vec(0, 0, 0)]
      for (let i = 1; i < atomCount; i++) {
        positions.push(vec(L * i, 0, 0))
      }
      return positions
    }
    case 'bent': {
      const angle = normalizeAngle(104.5)
      const half = angle / 2
      return [
        vec(0, 0, 0),
        vec(L * Math.sin(half), L * Math.cos(half), 0),
        vec(-L * Math.sin(half), L * Math.cos(half), 0),
      ]
    }
    case 'trigonal-planar': {
      const positions: THREE.Vector3[] = [vec(0, 0, 0)]
      for (let i = 0; i < Math.min(atomCount - 1, 3); i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2
        positions.push(vec(L * Math.cos(a), L * Math.sin(a), 0))
      }
      return positions
    }
    case 'tetrahedral': {
      const positions: THREE.Vector3[] = [vec(0, 0, 0)]
      const tet = [
        vec(1, 1, 1),
        vec(1, -1, -1),
        vec(-1, 1, -1),
        vec(-1, -1, 1),
      ]
      const scale = L / Math.sqrt(3)
      for (const v of tet.slice(0, Math.min(atomCount - 1, 4))) {
        positions.push(v.clone().multiplyScalar(scale))
      }
      return positions
    }
    case 'trigonal-bipyramidal': {
      const positions: THREE.Vector3[] = [vec(0, 0, 0)]
      for (let i = 0; i < Math.min(atomCount - 1, 3); i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2
        positions.push(vec(L * Math.cos(a), L * Math.sin(a), 0))
      }
      if (atomCount - 1 > 3) positions.push(vec(0, 0, L))
      if (atomCount - 1 > 4) positions.push(vec(0, 0, -L))
      return positions
    }
    case 'octahedral': {
      const positions: THREE.Vector3[] = [vec(0, 0, 0)]
      const dirs = [
        vec(1, 0, 0), vec(-1, 0, 0),
        vec(0, 1, 0), vec(0, -1, 0),
        vec(0, 0, 1), vec(0, 0, -1),
      ]
      for (const d of dirs.slice(0, Math.min(atomCount - 1, 6))) {
        positions.push(d.clone().multiplyScalar(L))
      }
      return positions
    }
  }
}

function resolveVSEPRDirections(count: number, bondLength: number): THREE.Vector3[] {
  const L = bondLength
  switch (count) {
    case 1: return [vec(0, L, 0)]
    case 2: {
      const a = Math.PI / 4
      return [vec(L * Math.sin(a), L * Math.cos(a), 0), vec(-L * Math.sin(a), L * Math.cos(a), 0)]
    }
    case 3: {
      const dirs: THREE.Vector3[] = []
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2
        dirs.push(vec(L * Math.cos(a), L * Math.sin(a), 0))
      }
      return dirs
    }
    case 4: {
      const scale = L / Math.sqrt(3)
      return [
        vec(1, 1, 1).multiplyScalar(scale),
        vec(1, -1, -1).multiplyScalar(scale),
        vec(-1, 1, -1).multiplyScalar(scale),
        vec(-1, -1, 1).multiplyScalar(scale),
      ]
    }
    case 5: {
      const dirs: THREE.Vector3[] = []
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2
        dirs.push(vec(L * Math.cos(a), L * Math.sin(a), 0))
      }
      dirs.push(vec(0, 0, L))
      dirs.push(vec(0, 0, -L))
      return dirs
    }
    case 6: {
      return [
        vec(L, 0, 0), vec(-L, 0, 0),
        vec(0, L, 0), vec(0, -L, 0),
        vec(0, 0, L), vec(0, 0, -L),
      ]
    }
    default: return [vec(0, L, 0)]
  }
}

function isMultiCenter(
  bonds: { from: number; to: number }[]
): boolean {
  const degree = new Map<number, number>()
  for (const b of bonds) {
    degree.set(b.from, (degree.get(b.from) || 0) + 1)
    degree.set(b.to, (degree.get(b.to) || 0) + 1)
  }
  let multiCount = 0
  for (const d of degree.values()) {
    if (d >= 2) multiCount++
  }
  return multiCount > 1
}

function findCycle(adj: number[][], start: number): number[] | null {
  const n = adj.length
  const parent = new Array(n).fill(-1)
  const visited = new Array(n).fill(false)

  function dfs(u: number, p: number): number[] | null {
    visited[u] = true
    for (const v of adj[u]) {
      if (v === p) continue
      if (visited[v]) {
        const cycle = [v]
        let cur = u
        while (cur !== v && cur !== -1) {
          cycle.push(cur)
          cur = parent[cur]
        }
        return cycle
      }
      parent[v] = u
      const result = dfs(v, u)
      if (result) return result
    }
    return null
  }

  return dfs(start, -1)
}

function layoutRing(
  ring: number[],
  positions: (THREE.Vector3 | null)[],
  bondLength: number
): THREE.Vector3 {
  const N = ring.length
  const R = bondLength / (2 * Math.sin(Math.PI / N))
  let sum = new THREE.Vector3()
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2
    const p = new THREE.Vector3(R * Math.cos(angle), R * Math.sin(angle), 0)
    positions[ring[i]] = p
    sum.add(p)
  }
  const center = sum.clone().multiplyScalar(1 / N)
  return center
}

function placePendantOnRing(
  ringAtomIdx: number,
  positions: (THREE.Vector3 | null)[],
  adj: number[][],
  ringSet: Set<number>,
  bondLength: number
): { index: number; position: THREE.Vector3 }[] {
  const pos = positions[ringAtomIdx]!

  const outDir = pos.clone().normalize()
  const up = new THREE.Vector3(0, 0, 1)
  const tanDir = new THREE.Vector3().crossVectors(outDir, up).normalize()

  const pendants = adj[ringAtomIdx].filter(i => !ringSet.has(i))
  return pendants.map((idx, i) => {
    const count = pendants.length
    if (count === 1) {
      const p = pos.clone().add(outDir.clone().multiplyScalar(bondLength))
      return { index: idx, position: p }
    }
    const tilt = 0.5
    const spread = (i - (count - 1) / 2) * 0.8
    const dir = new THREE.Vector3()
      .addScaledVector(outDir, Math.cos(spread) * tilt)
      .addScaledVector(tanDir, Math.sin(spread) * tilt)
      .addScaledVector(up, Math.sqrt(1 - tilt * tilt))
      .normalize()
    const p = pos.clone().add(dir.multiplyScalar(bondLength))
    return { index: idx, position: p }
  })
}

function generatePositionsFromGraph(
  elements: { element: string }[],
  bonds: { from: number; to: number }[],
  bondLength: number
): THREE.Vector3[] {
  const n = elements.length
  const positions: (THREE.Vector3 | null)[] = new Array(n).fill(null)

  const adj: number[][] = Array.from({ length: n }, () => [])
  for (const b of bonds) {
    adj[b.from].push(b.to)
    adj[b.to].push(b.from)
  }

  let root = 0
  let maxDegree = -1
  for (let i = 0; i < n; i++) {
    if (adj[i].length > maxDegree) {
      maxDegree = adj[i].length
      root = i
    }
  }

  const ring = findCycle(adj, root)
  const ringSet = new Set(ring || [])
  const visited = new Set<number>()
  const parentOf: number[] = new Array(n).fill(-1)
  const queue: number[] = []

  if (ring && ring.length >= 3) {
    layoutRing(ring, positions, bondLength)
    for (const idx of ring) {
      visited.add(idx)
      queue.push(idx)
    }
    for (const idx of ring) {
      const pendants = placePendantOnRing(idx, positions, adj, ringSet, bondLength)
      for (const { index, position } of pendants) {
        positions[index] = position
        parentOf[index] = idx
        visited.add(index)
        queue.push(index)
      }
    }
  } else {
    positions[root] = new THREE.Vector3(0, 0, 0)
    visited.add(root)
    queue.push(root)
  }

  while (queue.length > 0) {
    const cur = queue.shift()!
    const curPos = positions[cur]!

    const unplaced = adj[cur].filter(i => !visited.has(i))
    if (unplaced.length === 0) continue

    if (parentOf[cur] < 0) {
      const allDirs = resolveVSEPRDirections(adj[cur].length, bondLength)
      for (let i = 0; i < unplaced.length; i++) {
        const d = allDirs[i]
        const p = curPos.clone().add(d)
        positions[unplaced[i]] = p
        parentOf[unplaced[i]] = cur
        visited.add(unplaced[i])
        queue.push(unplaced[i])
      }
    } else {
      const totalNeighbors = adj[cur].length
      const allDirs = resolveVSEPRDirections(totalNeighbors, bondLength)

      const parentDir = new THREE.Vector3()
        .subVectors(positions[parentOf[cur]]!, curPos)
        .normalize()

      const alignDir = allDirs[0].clone().normalize()
      const q = new THREE.Quaternion().setFromUnitVectors(alignDir, parentDir)

      const childrenStart = 1
      for (let i = 0; i < unplaced.length; i++) {
        const dirIdx = childrenStart + i
        if (dirIdx < allDirs.length) {
          const d = allDirs[dirIdx].clone().applyQuaternion(q)
          const p = curPos.clone().add(d.clone().multiplyScalar(bondLength / d.length()))
          positions[unplaced[i]] = p
        } else {
          const ref = Math.abs(parentDir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
          const perp = new THREE.Vector3().crossVectors(parentDir, ref).normalize()
          const p = curPos.clone().add(perp.clone().multiplyScalar(bondLength))
          positions[unplaced[i]] = p
        }
        parentOf[unplaced[i]] = cur
        visited.add(unplaced[i])
        queue.push(unplaced[i])
      }
    }
  }

  return positions.map(p => p || new THREE.Vector3(0, 0, 0))
}

export function buildMolecule3D(
  geometry: GeometryType,
  elements: { element: string; label: string; parentIndex?: number }[],
  bonds: { from: number; to: number; type: 1 | 2 | 3 }[],
  bondLength?: number
): Molecule3D {
  const bl = bondLength ?? BOND_LENGTH

  const positions = isMultiCenter(bonds)
    ? generatePositionsFromGraph(elements, bonds, bl)
    : generatePositions(geometry, elements.length, bl)

  const atoms: MolAtom[] = elements.map((el, i) => ({
    element: el.element,
    label: el.label,
    color: CPK_COLORS[el.element] ?? '#888888',
    position: positions[i] ?? new THREE.Vector3(0, 0, 0),
  }))

  let centeringAtoms = atoms
  for (let i = 0; i < atoms.length; i++) {
    const parent = elements[i].parentIndex
    if (parent !== undefined && atoms[parent]) {
      const dir = new THREE.Vector3().subVectors(atoms[parent].position, atoms[0].position).normalize()
      atoms[i].position.copy(atoms[parent].position).add(dir.multiplyScalar(bl * 0.7))
      centeringAtoms = atoms.filter((_, idx) => elements[idx].parentIndex === undefined)
    }
  }

  const center = new THREE.Vector3()
  for (const a of centeringAtoms) center.add(a.position)
  center.divideScalar(centeringAtoms.length)

  const molBonds: MolBond[] = bonds.map((b) => ({
    from: b.from,
    to: b.to,
    type: b.type,
  }))

  return { atoms, bonds: molBonds, center }
}
