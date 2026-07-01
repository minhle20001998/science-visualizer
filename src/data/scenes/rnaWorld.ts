export interface SceneOrb {
  element: string
  position: [number, number, number]
  detailKey: string
}

export interface SceneBond {
  from: number
  to: number
  type: 1 | 2 | 3
  animated?: boolean
}

export interface SceneLabel {
  text: string
  position: [number, number, number]
  detailKey?: string
}

export interface SceneVariant {
  title: string
  description: string
  orbs: SceneOrb[]
  bonds: SceneBond[]
  labels: SceneLabel[]
}

export interface FloatingBond {
  position: [number, number, number]
  detailKey: string
}

export interface SceneData {
  id: string
  title: string
  description: string
  orbs: SceneOrb[]
  bonds: SceneBond[]
  labels: SceneLabel[]
  floatingBonds: FloatingBond[]
  variants?: SceneVariant[]
}

function randomSpherePoint(radius: number): [number, number, number] {
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)
  const r = Math.cbrt(Math.random()) * radius
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ]
}

const SOUP_TYPES = [
  { element: 'H2O', detailKey: 'H2O', count: 8 },
  { element: 'CH4', detailKey: 'CH4', count: 6 },
  { element: 'NH3', detailKey: 'NH3', count: 6 },
  { element: 'H2', detailKey: 'H2', count: 5 },
  { element: 'CO2', detailKey: 'CO2', count: 5 },
  { element: 'HCN', detailKey: 'HCN', count: 4 },
  { element: 'N2', detailKey: 'N2', count: 3 },
  { element: 'H2S', detailKey: 'H2S', count: 3 },
  { element: 'Ribose', detailKey: 'Ribose', count: 6 },
  { element: 'Pi', detailKey: 'Pi', count: 6 },
]

function generateSoupOrbs(): SceneOrb[] {
  const orbs: SceneOrb[] = []
  for (const type of SOUP_TYPES) {
    for (let i = 0; i < type.count; i++) {
      orbs.push({
        element: type.element,
        position: randomSpherePoint(8),
        detailKey: type.detailKey,
      })
    }
  }
  return orbs
}

export const rnaWorldScenes: SceneData[] = [
  {
    id: 'soup',
    title: 'Primordial Soup',
    description: 'Simple molecules floating in the early Earth oceans — the chemical ingredients that gave rise to life.',
    orbs: generateSoupOrbs(),
    bonds: [],
    labels: [],
    floatingBonds: [],
  },
  {
    id: 'phosphodiester',
    title: 'Phosphodiester Formation',
    description: 'Ribose sugars and phosphates join to form the RNA backbone, then bases attach to complete the nucleotides.',
    orbs: [
      { element: 'Ribose', position: [-3.5, 0, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [-1, 0, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [0, 0, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [1, 0, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [3.5, 0, 0], detailKey: 'Ribose' },
      { element: 'A', position: [-5, -2, 0], detailKey: 'A' },
      { element: 'U', position: [0, -2.5, 0], detailKey: 'U' },
      { element: 'G', position: [5, -2, 0], detailKey: 'G' },
      { element: 'H2O', position: [0, 2.5, 0], detailKey: 'H2O' },
      { element: 'CH4', position: [-5.5, 2, 2], detailKey: 'CH4' },
      { element: 'NH3', position: [5, 2.5, -1.5], detailKey: 'NH3' },
      { element: 'CO2', position: [-3, -3, 1.5], detailKey: 'CO2' },
      { element: 'HCN', position: [3, -3, 1.5], detailKey: 'HCN' },
    ],
    bonds: [
      { from: 0, to: 1, type: 1, animated: true },
      { from: 1, to: 2, type: 1, animated: true },
      { from: 2, to: 3, type: 1, animated: true },
      { from: 3, to: 4, type: 1, animated: true },
      { from: 0, to: 5, type: 1, animated: true },
      { from: 2, to: 6, type: 1, animated: true },
      { from: 4, to: 7, type: 1, animated: true },
    ],
    labels: [],
    floatingBonds: [],
  },
  {
    id: 'rna-strand',
    title: 'RNA Strand',
    description: 'A growing chain of nucleotides linked 5\' to 3\', carrying genetic information in its base sequence.',
    orbs: [
      { element: 'Ribose', position: [0, 0, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [0.75, 0, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [1.5, 0, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [2.25, 0, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [3.0, 0, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [3.75, 0, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [4.5, 0, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [5.25, 0, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [6.0, 0, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [6.75, 0, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [7.5, 0, 0], detailKey: 'Ribose' },
      { element: 'A', position: [0, -0.5, 0.5], detailKey: 'A' },
      { element: 'G', position: [1.5, -0.5, 0.5], detailKey: 'G' },
      { element: 'C', position: [3.0, -0.5, 0.5], detailKey: 'C' },
      { element: 'U', position: [4.5, -0.5, 0.5], detailKey: 'U' },
      { element: 'A', position: [6.0, -0.5, 0.5], detailKey: 'A' },
      { element: 'G', position: [7.5, -0.5, 0.5], detailKey: 'G' },
    ],
    bonds: [
      { from: 0, to: 1, type: 1 },
      { from: 1, to: 2, type: 1 },
      { from: 2, to: 3, type: 1 },
      { from: 3, to: 4, type: 1 },
      { from: 4, to: 5, type: 1 },
      { from: 5, to: 6, type: 1 },
      { from: 6, to: 7, type: 1 },
      { from: 7, to: 8, type: 1 },
      { from: 8, to: 9, type: 1 },
      { from: 9, to: 10, type: 1 },
      { from: 0, to: 11, type: 1 },
      { from: 2, to: 12, type: 1 },
      { from: 4, to: 13, type: 1 },
      { from: 6, to: 14, type: 1 },
      { from: 8, to: 15, type: 1 },
      { from: 10, to: 16, type: 1 },
    ],
    labels: [
      { text: "5'", position: [-0.6, -0.6, 0], detailKey: '5prime' },
      { text: "3'", position: [8.1, 0.6, 0], detailKey: '3prime' },
    ],
    floatingBonds: [],
    variants: [{
      title: 'RNA Stem-Loop Hairpin',
      description: 'Base pairing between A–U and G–C creates a double-stranded Stem. The unpaired turn at the top forms a Loop. RNA strands that fail to fold into stable structures like this are broken down by temperature, ocean waves, or sunlight — only folded RNA survives.',
      orbs: [
        { element: 'Ribose', position: [0, 0, 0], detailKey: 'Ribose' },
        { element: 'Pi', position: [0, 0.8, 0], detailKey: 'Pi' },
        { element: 'Ribose', position: [0, 1.6, 0], detailKey: 'Ribose' },
        { element: 'Pi', position: [1.0, 2.6, 0], detailKey: 'Pi' },
        { element: 'Ribose', position: [2.0, 2.6, 0], detailKey: 'Ribose' },
        { element: 'Pi', position: [2.0, 1.6, 0], detailKey: 'Pi' },
        { element: 'Ribose', position: [2.0, 0.8, 0], detailKey: 'Ribose' },
        { element: 'Pi', position: [2.0, 0, 0], detailKey: 'Pi' },
        { element: 'Ribose', position: [2.0, -0.8, 0], detailKey: 'Ribose' },
        { element: 'Pi', position: [3.0, -1.8, 0], detailKey: 'Pi' },
        { element: 'Ribose', position: [4.0, -0.8, 0], detailKey: 'Ribose' },
        { element: 'A', position: [0.7, 0, 0.8], detailKey: 'A' },
        { element: 'G', position: [0.7, 1.6, 0.8], detailKey: 'G' },
        { element: 'C', position: [1.3, 2.6, 0.8], detailKey: 'C' },
        { element: 'U', position: [1.3, 0.8, 0.8], detailKey: 'U' },
        { element: 'A', position: [2.7, -0.8, 0.8], detailKey: 'A' },
        { element: 'G', position: [4.7, -0.8, 0.8], detailKey: 'G' },
      ],
      bonds: [
        { from: 0, to: 1, type: 1 },
        { from: 1, to: 2, type: 1 },
        { from: 2, to: 3, type: 1 },
        { from: 3, to: 4, type: 1 },
        { from: 4, to: 5, type: 1 },
        { from: 5, to: 6, type: 1 },
        { from: 6, to: 7, type: 1 },
        { from: 7, to: 8, type: 1 },
        { from: 8, to: 9, type: 1 },
        { from: 9, to: 10, type: 1 },
        { from: 0, to: 11, type: 1 },
        { from: 2, to: 12, type: 1 },
        { from: 4, to: 13, type: 1 },
        { from: 6, to: 14, type: 1 },
        { from: 8, to: 15, type: 1 },
        { from: 10, to: 16, type: 1 },
        { from: 11, to: 14, type: 2 },
        { from: 12, to: 13, type: 2 },
      ],
      labels: [
        { text: "5'", position: [-0.5, -0.3, 0.8], detailKey: '5prime' },
        { text: "3'", position: [4.5, -0.3, 1.2], detailKey: '3prime' },
        { text: 'Stem', position: [1.0, 0.4, 0.5], detailKey: 'Stem' },
        { text: 'Loop', position: [1.0, 2.8, 0.5], detailKey: 'Loop' },
      ],
    }],
  },
  {
    id: 'replication',
    title: 'RNA Self-Replication',
    description: 'A folded RNA hairpin serves as a template. Free NTPs — each with a Base, Ribose, and triphosphate tail (Piα–Piβ–Piγ) — dock by base pairing. The Piα–Piβ bond (the "fuse") breaks, PPi (Piβ–Piγ) flies away, and the remaining nucleotide ligates into a complementary strand.',
    orbs: [
      { element: 'Ribose', position: [0, 0, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [0, 0.8, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [0, 1.6, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [1.0, 2.6, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [2.0, 2.6, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [2.0, 1.6, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [2.0, 0.8, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [2.0, 0, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [2.0, -0.8, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [3.0, -1.8, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [4.0, -0.8, 0], detailKey: 'Ribose' },
      { element: 'A', position: [0.7, 0, 0.8], detailKey: 'A' },
      { element: 'G', position: [0.7, 1.6, 0.8], detailKey: 'G' },
      { element: 'C', position: [1.3, 2.6, 0.8], detailKey: 'C' },
      { element: 'U', position: [1.3, 0.8, 0.8], detailKey: 'U' },
      { element: 'A', position: [2.7, -0.8, 0.8], detailKey: 'A' },
      { element: 'G', position: [4.7, -0.8, 0.8], detailKey: 'G' },
      { element: 'Ribose', position: [6, 0, 0], detailKey: 'Ribose' },
      { element: 'Ribose', position: [6, 0, 0], detailKey: 'Ribose' },
      { element: 'Ribose', position: [6, 0, 0], detailKey: 'Ribose' },
      { element: 'Ribose', position: [6, 0, 0], detailKey: 'Ribose' },
      { element: 'Ribose', position: [6, 0, 0], detailKey: 'Ribose' },
      { element: 'Ribose', position: [6, 0, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'Pi', position: [6, 0, 0], detailKey: 'Pi' },
      { element: 'U', position: [6, 0, 0], detailKey: 'U' },
      { element: 'C', position: [6, 0, 0], detailKey: 'C' },
      { element: 'G', position: [6, 0, 0], detailKey: 'G' },
      { element: 'A', position: [6, 0, 0], detailKey: 'A' },
      { element: 'U', position: [6, 0, 0], detailKey: 'U' },
      { element: 'C', position: [6, 0, 0], detailKey: 'C' },
      { element: 'H2O', position: [0, 0, 0], detailKey: 'H2O' },
      { element: 'CH4', position: [0, 0, 0], detailKey: 'CH4' },
      { element: 'NH3', position: [0, 0, 0], detailKey: 'NH3' },
      { element: 'CO2', position: [0, 0, 0], detailKey: 'CO2' },
      { element: 'HCN', position: [0, 0, 0], detailKey: 'HCN' },
      { element: 'H2O', position: [0, 0, 0], detailKey: 'H2O' },
      { element: 'CH4', position: [0, 0, 0], detailKey: 'CH4' },
      { element: 'NH3', position: [0, 0, 0], detailKey: 'NH3' },
      { element: 'CO2', position: [0, 0, 0], detailKey: 'CO2' },
      { element: 'HCN', position: [0, 0, 0], detailKey: 'HCN' },
    ],
    bonds: [
      { from: 0, to: 1, type: 1 },
      { from: 1, to: 2, type: 1 },
      { from: 2, to: 3, type: 1 },
      { from: 3, to: 4, type: 1 },
      { from: 4, to: 5, type: 1 },
      { from: 5, to: 6, type: 1 },
      { from: 6, to: 7, type: 1 },
      { from: 7, to: 8, type: 1 },
      { from: 8, to: 9, type: 1 },
      { from: 9, to: 10, type: 1 },
      { from: 0, to: 11, type: 1 },
      { from: 2, to: 12, type: 1 },
      { from: 4, to: 13, type: 1 },
      { from: 6, to: 14, type: 1 },
      { from: 8, to: 15, type: 1 },
      { from: 10, to: 16, type: 1 },
      { from: 11, to: 14, type: 2 },
      { from: 12, to: 13, type: 2 },
    ],
    labels: [
      { text: "5'", position: [-0.5, -0.3, 0.8], detailKey: '5prime' },
      { text: "3'", position: [4.5, -0.3, 1.2], detailKey: '3prime' },
      { text: 'Stem', position: [1.0, 0.4, 0.5], detailKey: 'Stem' },
      { text: 'Loop', position: [1.0, 2.8, 0.5], detailKey: 'Loop' },
    ],
    floatingBonds: [],
  },
  {
    id: 'protocell',
    title: 'Protocell Formation',
    description: 'Phospholipids spontaneously self-assemble around the RNA, forming a lipid bilayer membrane. This primitive protocell compartment concentrates reactants and protects the genetic material — a critical step toward the first living cell.',
    orbs: [
      { element: 'Ribose', position: [0, 0, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [0, 0.8, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [0, 1.6, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [1.0, 2.6, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [2.0, 2.6, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [2.0, 1.6, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [2.0, 0.8, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [2.0, 0, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [2.0, -0.8, 0], detailKey: 'Ribose' },
      { element: 'Pi', position: [3.0, -1.8, 0], detailKey: 'Pi' },
      { element: 'Ribose', position: [4.0, -0.8, 0], detailKey: 'Ribose' },
      { element: 'A', position: [0.7, 0, 0.8], detailKey: 'A' },
      { element: 'G', position: [0.7, 1.6, 0.8], detailKey: 'G' },
      { element: 'C', position: [1.3, 2.6, 0.8], detailKey: 'C' },
      { element: 'U', position: [1.3, 0.8, 0.8], detailKey: 'U' },
      { element: 'A', position: [2.7, -0.8, 0.8], detailKey: 'A' },
      { element: 'G', position: [4.7, -0.8, 0.8], detailKey: 'G' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
      { element: 'Phospholipid', position: [0, 0, 0], detailKey: 'Phospho-head' },
      { element: 'Fatty-tail', position: [0, 0, 0], detailKey: 'Fatty-tail' },
    ],
    bonds: [
      { from: 0, to: 1, type: 1 },
      { from: 1, to: 2, type: 1 },
      { from: 2, to: 3, type: 1 },
      { from: 3, to: 4, type: 1 },
      { from: 4, to: 5, type: 1 },
      { from: 5, to: 6, type: 1 },
      { from: 6, to: 7, type: 1 },
      { from: 7, to: 8, type: 1 },
      { from: 8, to: 9, type: 1 },
      { from: 9, to: 10, type: 1 },
      { from: 0, to: 11, type: 1 },
      { from: 2, to: 12, type: 1 },
      { from: 4, to: 13, type: 1 },
      { from: 6, to: 14, type: 1 },
      { from: 8, to: 15, type: 1 },
      { from: 10, to: 16, type: 1 },
      { from: 11, to: 14, type: 2 },
      { from: 12, to: 13, type: 2 },
    ],
    labels: [
      { text: "RNA", position: [2.0, 0.4, 1.2], detailKey: 'Ribose' },
      { text: "Protocell", position: [1.7, 2.6, 2.5], detailKey: 'Protocell' },
      { text: "Hydrophilic Head", position: [4.5, 3.0, 2.0], detailKey: 'Phospho-head' },
      { text: "Hydrophobic Tail", position: [3.5, -2.5, 2.5], detailKey: 'Fatty-tail' },
    ],
    floatingBonds: [],
  },
]
