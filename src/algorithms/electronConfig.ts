export interface SubshellConfig {
  n: number
  l: number
  label: string
  count: number
}

const ORBITAL_ORDER: { n: number; l: number; label: string; capacity: number; radius: number }[] = [
  { n: 1, l: 0, label: '1s', capacity: 2, radius: 1.0 },
  { n: 2, l: 0, label: '2s', capacity: 2, radius: 2.0 },
  { n: 2, l: 1, label: '2p', capacity: 6, radius: 2.4 },
  { n: 3, l: 0, label: '3s', capacity: 2, radius: 3.2 },
  { n: 3, l: 1, label: '3p', capacity: 6, radius: 3.6 },
  { n: 4, l: 0, label: '4s', capacity: 2, radius: 4.2 },
  { n: 3, l: 2, label: '3d', capacity: 10, radius: 3.8 },
  { n: 4, l: 1, label: '4p', capacity: 6, radius: 4.6 },
  { n: 5, l: 0, label: '5s', capacity: 2, radius: 5.2 },
  { n: 4, l: 2, label: '4d', capacity: 10, radius: 4.8 },
  { n: 5, l: 1, label: '5p', capacity: 6, radius: 5.6 },
  { n: 6, l: 0, label: '6s', capacity: 2, radius: 6.2 },
  { n: 4, l: 3, label: '4f', capacity: 14, radius: 5.0 },
  { n: 5, l: 2, label: '5d', capacity: 10, radius: 5.8 },
  { n: 6, l: 1, label: '6p', capacity: 6, radius: 6.6 },
  { n: 7, l: 0, label: '7s', capacity: 2, radius: 7.2 },
  { n: 5, l: 3, label: '5f', capacity: 14, radius: 6.0 },
  { n: 6, l: 2, label: '6d', capacity: 10, radius: 6.8 },
  { n: 7, l: 1, label: '7p', capacity: 6, radius: 7.6 },
]

export function getElectronConfig(z: number): SubshellConfig[] {
  let remaining = z
  const config: SubshellConfig[] = []
  for (const orbital of ORBITAL_ORDER) {
    if (remaining <= 0) break
    const count = Math.min(remaining, orbital.capacity)
    config.push({ n: orbital.n, l: orbital.l, label: orbital.label, count })
    remaining -= count
  }
  return config
}

