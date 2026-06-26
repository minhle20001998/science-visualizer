export interface Nucleon {
  position: [number, number, number]
  type: 'proton' | 'neutron'
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function packNucleus(protons: number, neutrons: number): Nucleon[] {
  const total = protons + neutrons
  const radius = Math.cbrt(total) * 0.6
  const rand = seededRandom(42)
  const result: Nucleon[] = []

  const positions: [number, number, number][] = []

  for (let i = 0; i < total; i++) {
    let pos: [number, number, number]
    let attempts = 0
    do {
      const theta = rand() * Math.PI * 2
      const phi = Math.acos(2 * rand() - 1)
      const r = radius * Math.cbrt(rand())
      pos = [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ]
      attempts++
    } while (
      attempts < 50 &&
      positions.some(
        (p) =>
          Math.sqrt(
            (p[0] - pos[0]) ** 2 + (p[1] - pos[1]) ** 2 + (p[2] - pos[2]) ** 2
          ) < 0.25
      )
    )
    positions.push(pos)
    result.push({
      position: pos,
      type: i < protons ? 'proton' : 'neutron',
    })
  }

  return result
}
