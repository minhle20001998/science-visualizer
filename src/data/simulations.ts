export interface Simulation {
  id: string
  title: string
  description: string
  tags: string[]
  icon: string
}

export const SIMULATIONS: Simulation[] = [
  {
    id: 'atom',
    title: 'Atom Visualizer',
    description: 'Interactive 3D model of electron orbitals, showing real spherical harmonic shapes, electron spin, and Hund\'s rule filling.',
    tags: ['physics', 'chemistry'],
    icon: '⚛',
  },
  {
    id: 'molecule',
    title: 'Molecule Visualizer',
    description: 'Explore 3D molecular structures with ball-and-stick and space-filling models. View bond geometries and shared electron pairs.',
    tags: ['chemistry', 'biology'],
    icon: '🧬',
  },
  {
    id: 'builder',
    title: 'Molecule Builder',
    description: 'Sandbox for building custom molecules. Pick atoms from a palette, place them in 3D, and watch bonds form automatically.',
    tags: ['chemistry'],
    icon: '🔧',
  },
  {
    id: 'biology',
    title: 'Life Simulation',
    description: 'Interactive 3D simulations of biological systems and the molecular origins of life.',
    tags: ['biology'],
    icon: '🌱',
  },
  {
    id: 'electronics',
    title: 'Electronics',
    description: 'Interactive 3D visualizations showing how electricity flows through human-made components — transistors, circuits, and beyond.',
    tags: ['physics', 'electronics'],
    icon: '🔌',
  },
]
