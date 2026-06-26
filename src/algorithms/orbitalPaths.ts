import * as THREE from 'three'

export type OrbitalShape = 's' | 'p' | 'd' | 'f'

export interface ElectronAssignment {
  id: number
  label: string
  n: number
  l: number
  shape: OrbitalShape
  radius: number
  axisIndex: number
  lobeSign: 1 | -1
  paired: boolean
  spin: '↑' | '↓'
}

const P_AXES: [number, number, number][] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function getOrbitalShape(l: number): OrbitalShape {
  if (l === 0) return 's'
  if (l === 1) return 'p'
  if (l === 2) return 'd'
  return 'f'
}

export function assignElectrons(
  config: { label: string; n: number; l: number; count: number }[]
): ElectronAssignment[] {
  const result: ElectronAssignment[] = []
  let id = 0

  for (const sub of config) {
    const shape = getOrbitalShape(sub.l)
    const radius = sub.n * 4.5 + 1.5 * (sub.n - 1)
    let remaining = sub.count

    if (shape === 's') {
      for (let i = 0; i < sub.count; i++) {
        result.push({
          id: id++,
          label: sub.label,
          n: sub.n,
          l: sub.l,
          shape,
          radius,
          axisIndex: 0,
          lobeSign: 1,
          paired: i > 0,
          spin: i % 2 === 0 ? '↑' : '↓',
        })
      }
    } else if (shape === 'p') {
      const axisCounts = [0, 0, 0]
      for (let pass = 0; pass < 2 && remaining > 0; pass++) {
        for (let axis = 0; axis < 3 && remaining > 0; axis++) {
          axisCounts[axis]++
          const paired = axisCounts[axis] > 1
          result.push({
            id: id++,
            label: sub.label,
            n: sub.n,
            l: sub.l,
            shape,
            radius,
            axisIndex: axis,
            lobeSign: paired ? -1 : 1,
            paired,
            spin: paired ? '↓' : '↑',
          })
          remaining--
        }
      }
    } else if (shape === 'd') {
      const axisCounts = [0, 0, 0, 0, 0]
      for (let pass = 0; pass < 2 && remaining > 0; pass++) {
        for (let axis = 0; axis < 5 && remaining > 0; axis++) {
          axisCounts[axis]++
          const paired = axisCounts[axis] > 1
          result.push({
            id: id++,
            label: sub.label,
            n: sub.n,
            l: sub.l,
            shape,
            radius: radius + 0.3,
            axisIndex: axis,
            lobeSign: paired ? -1 : 1,
            paired,
            spin: paired ? '↓' : '↑',
          })
          remaining--
        }
      }
    } else {
      const axisCounts = [0, 0, 0, 0, 0, 0, 0, 0]
      for (let pass = 0; pass < 2 && remaining > 0; pass++) {
        for (let axis = 0; axis < 8 && remaining > 0; axis++) {
          axisCounts[axis]++
          const paired = axisCounts[axis] > 1
          result.push({
            id: id++,
            label: sub.label,
            n: sub.n,
            l: sub.l,
            shape,
            radius: radius + 0.5,
            axisIndex: axis,
            lobeSign: paired ? -1 : 1,
            paired,
            spin: paired ? '↓' : '↑',
          })
          remaining--
        }
      }
    }
  }

  return result
}

export function getElectronPosition(
  assignment: ElectronAssignment,
  time: number,
  minRadius?: number
): THREE.Vector3 {
  const rand = seededRandom(assignment.id * 7 + 13)
  const baseR = assignment.radius
  const t = time * 0.5
  const phase = rand() * 6.28

  let pos: THREE.Vector3

  switch (assignment.shape) {
    case 's': {
      const theta = t * 0.8 + phase * 0.3
      const phi = t * 0.6 + phase * 0.3
      const r = baseR * (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 0.5 + phase)))
      pos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      )
      break
    }
    case 'p': {
      const axis = P_AXES[assignment.axisIndex]
      const axVec = new THREE.Vector3(...axis)

      const perp1 = new THREE.Vector3()
      const perp2 = new THREE.Vector3()
      if (Math.abs(axis[0]) < 0.9) {
        perp1.crossVectors(axVec, new THREE.Vector3(1, 0, 0)).normalize()
      } else {
        perp1.crossVectors(axVec, new THREE.Vector3(0, 1, 0)).normalize()
      }
      perp2.crossVectors(axVec, perp1).normalize()

      const pairPhase = assignment.paired ? Math.PI * (assignment.lobeSign < 0 ? 1 : 0) : 0
      const axialOffset = baseR * 0.55 * Math.sin(t * 0.6 + phase + pairPhase)
      const wobbleR = baseR * 0.35 * (0.5 + 0.5 * Math.sin(t * 0.8 + phase * 1.3))
      const angle = t * 0.9 + phase * 0.5

      pos = axVec.clone().multiplyScalar(axialOffset)
      pos.add(perp1.clone().multiplyScalar(wobbleR * Math.cos(angle)))
      pos.add(perp2.clone().multiplyScalar(wobbleR * Math.sin(angle) * 0.7))
      break
    }
    case 'd': {
      const dAxes: [number, number, number][] = [
        [1, 0, 0], [-1, 0, 0],
        [0, 1, 0], [0, -1, 0],
        [0, 0, 1],
      ]
      const ax = dAxes[assignment.axisIndex % 5]
      const av = new THREE.Vector3(...ax)

      const p1 = new THREE.Vector3()
      const p2 = new THREE.Vector3()
      if (Math.abs(ax[0]) < 0.9) {
        p1.crossVectors(av, new THREE.Vector3(1, 0, 0)).normalize()
      } else {
        p1.crossVectors(av, new THREE.Vector3(0, 1, 0)).normalize()
      }
      p2.crossVectors(av, p1).normalize()

      const pairPhase = assignment.paired ? Math.PI * (assignment.lobeSign < 0 ? 1 : 0) : 0
      const axialOffset = baseR * 0.5 * Math.sin(t * 0.7 + phase + pairPhase)
      const wobbleR = baseR * 0.3 * (0.5 + 0.5 * Math.sin(t * 0.9 + phase * 1.7))
      const angle = t * 0.8 + phase * 0.4

      pos = av.clone().multiplyScalar(axialOffset)
      pos.add(p1.clone().multiplyScalar(wobbleR * Math.cos(angle)))
      pos.add(p2.clone().multiplyScalar(wobbleR * Math.sin(angle) * 0.7))
      break
    }
    case 'f': {
      const theta = t * 0.5 + phase * 0.4
      const phi = t * 0.4 + phase * 0.3
      const r = baseR * (0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * 0.5 + phase)))
      const mod = Math.sin(3 * phi) * Math.cos(2 * theta)
      const rr = r * (0.4 + 0.6 * Math.abs(mod))
      pos = new THREE.Vector3(
        rr * Math.sin(phi) * Math.cos(theta),
        rr * Math.sin(phi) * Math.sin(theta),
        rr * Math.cos(phi)
      )
      break
    }
  }

  if (minRadius !== undefined) {
    const d = pos.length()
    if (d < minRadius && d > 0.001) {
      pos.multiplyScalar(minRadius / d)
    }
  }
  return pos
}
