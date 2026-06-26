const VALENCE: Record<string, number> = {
  H: 1, C: 4, N: 3, O: 2, F: 1,
  Cl: 1, Br: 1, I: 1, S: 6, P: 5,
  Na: 1, K: 1,
}

const CPK_COLORS: Record<string, string> = {
  H: '#ffffff', C: '#404040', N: '#3050f8', O: '#ff0d0d',
  F: '#90e050', Cl: '#1ff01f', Br: '#a62929', I: '#940094',
  S: '#ffff30', P: '#ff8000', Na: '#ab5cf2', K: '#8f40d4',
}

export function getValence(element: string): number {
  return VALENCE[element] ?? 1
}

export function getCpkColor(element: string): string {
  return CPK_COLORS[element] ?? '#888888'
}

export interface PlacedAtom {
  id: number
  element: string
  position: [number, number, number]
}

export interface BuilderBond {
  from: number
  to: number
}

const BOND_THRESHOLD = 2.5
const BOND_BREAK_THRESHOLD = 3.5

export function getUsedSlots(atomId: number, bonds: BuilderBond[]): number {
  return bonds.filter(b => b.from === atomId || b.to === atomId).length
}

export function detectBonds(atoms: PlacedAtom[], existingBonds: BuilderBond[]): BuilderBond[] {
  const newBonds: BuilderBond[] = [...existingBonds]

  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const idI = atoms[i].id
      const idJ = atoms[j].id
      const alreadyBonded = existingBonds.some(
        b => (b.from === idI && b.to === idJ) || (b.from === idJ && b.to === idI)
      )
      if (alreadyBonded) continue

      const dist = distance(atoms[i].position, atoms[j].position)
      if (dist > BOND_THRESHOLD) continue

      const usedI = getUsedSlots(idI, newBonds)
      const usedJ = getUsedSlots(idJ, newBonds)
      if (getValence(atoms[i].element) - usedI <= 0) continue
      if (getValence(atoms[j].element) - usedJ <= 0) continue

      newBonds.push({ from: idI, to: idJ })
    }
  }

  return newBonds
}

export function breakBonds(atoms: PlacedAtom[], existingBonds: BuilderBond[]): BuilderBond[] {
  return existingBonds.filter(b => {
    const dist = distance(atoms[b.from].position, atoms[b.to].position)
    return dist < BOND_BREAK_THRESHOLD
  })
}

function distance(a: [number, number, number], b: [number, number, number]): number {
  const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2]
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function getConnectedComponent(
  atomId: number,
  atoms: PlacedAtom[],
  bonds: BuilderBond[]
): number[] {
  const hasAtom = atoms.some(a => a.id === atomId)
  if (!hasAtom) return [atomId]

  const visited = new Set<number>()
  const queue = [atomId]
  visited.add(atomId)

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const b of bonds) {
      if (b.from === current && !visited.has(b.to)) {
        visited.add(b.to)
        queue.push(b.to)
      }
      if (b.to === current && !visited.has(b.from)) {
        visited.add(b.from)
        queue.push(b.from)
      }
    }
  }

  return Array.from(visited)
}

export function resolveVSEPR(neighborCount: number): [number, number, number][] {
  switch (neighborCount) {
    case 1:
      return [[0, 1, 0]]
    case 2: {
      const a = Math.PI / 4
      return [[Math.sin(a), Math.cos(a), 0], [-Math.sin(a), Math.cos(a), 0]]
    }
    case 3: {
      const dirs: [number, number, number][] = []
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2
        dirs.push([Math.cos(a), Math.sin(a), 0])
      }
      return dirs
    }
    case 4: {
      const scale = 1 / Math.sqrt(3)
      return [
        [1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]
      ].map(v => v.map(c => c * scale)) as [number, number, number][]
    }
    case 5: {
      const dirs: [number, number, number][] = []
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2
        dirs.push([Math.cos(a), Math.sin(a), 0])
      }
      dirs.push([0, 0, 1], [0, 0, -1])
      return dirs
    }
    case 6: {
      return [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
    }
    default:
      return [[0, 1, 0]]
  }
}

export interface ValidationError {
  type: 'overfilled' | 'unstable'
  atomId: number
  message: string
}

export function validateMolecule(atoms: PlacedAtom[], bonds: BuilderBond[]): ValidationError[] {
  const errors: ValidationError[] = []
  for (const atom of atoms) {
    const used = getUsedSlots(atom.id, bonds)
    const valence = getValence(atom.element)
    if (used > valence) {
      errors.push({
        type: 'overfilled',
        atomId: atom.id,
        message: `${atom.element} has ${used} bonds but valence is ${valence}`,
      })
    }
    if (used < valence && atoms.length > 1) {
      errors.push({
        type: 'unstable',
        atomId: atom.id,
        message: `${atom.element} has ${used}/${valence} bonds (radical)`,
      })
    }
  }
  return errors
}

export function getFormula(atoms: PlacedAtom[], bonds: BuilderBond[]): string {
  if (atoms.length === 0) return ''

  const bondedIds = new Set<number>()
  for (const b of bonds) {
    bondedIds.add(b.from)
    bondedIds.add(b.to)
  }

  const relevant = bonds.length > 0
    ? atoms.filter(a => bondedIds.has(a.id))
    : atoms

  if (relevant.length === 0) return ''

  const counts: Record<string, number> = {}
  for (const a of relevant) {
    counts[a.element] = (counts[a.element] || 0) + 1
  }
  const order = ['C', 'Na', 'K', 'N', 'P', 'H', 'S', 'O', 'F', 'Cl', 'Br', 'I']
  return Object.entries(counts)
    .sort(([a], [b]) => {
      const ia = order.indexOf(a), ib = order.indexOf(b)
      if (ia !== -1 && ib !== -1) return ia - ib
      if (ia !== -1) return -1
      if (ib !== -1) return 1
      return a.localeCompare(b)
    })
    .map(([el, count]) => count > 1 ? `${el}${count}` : el)
    .join('')
}
