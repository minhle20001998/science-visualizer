import { create } from 'zustand'

interface ElectronInfo {
  index: number
  label: string
  spin: '↑' | '↓'
}

type MoleculeViewMode = 'ball-and-stick' | 'space-filling'

interface AppState {
  atomicNumber: number
  speed: number
  showOrbitals: boolean
  autoRotate: boolean
  highlightedOrbitals: string[]
  selectedElectron: ElectronInfo | null
  moleculeViewMode: MoleculeViewMode
  showSharedElectrons: boolean
  setAtomicNumber: (n: number) => void
  setSpeed: (s: number) => void
  toggleOrbitals: () => void
  toggleAutoRotate: () => void
  toggleHighlight: (key: string) => void
  clearHighlights: () => void
  selectElectron: (info: ElectronInfo | null) => void
  setMoleculeViewMode: (mode: MoleculeViewMode) => void
  setShowSharedElectrons: (show: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  atomicNumber: 18,
  speed: 0.5,
  showOrbitals: true,
  autoRotate: false,
  highlightedOrbitals: [],
  selectedElectron: null,
  moleculeViewMode: 'ball-and-stick',
  showSharedElectrons: true,
  setAtomicNumber: (n) => set({ atomicNumber: Math.max(1, Math.min(118, n)), selectedElectron: null, highlightedOrbitals: [] }),
  setSpeed: (s) => set({ speed: Math.max(0, Math.min(1, s)) }),
  toggleOrbitals: () => set((s) => ({ showOrbitals: !s.showOrbitals })),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  toggleHighlight: (key) => set((s) => ({
    highlightedOrbitals: s.highlightedOrbitals.includes(key)
      ? s.highlightedOrbitals.filter((k) => k !== key)
      : [...s.highlightedOrbitals, key],
  })),
  clearHighlights: () => set({ highlightedOrbitals: [] }),
  selectElectron: (info) => set({ selectedElectron: info }),
  setMoleculeViewMode: (mode) => set({ moleculeViewMode: mode }),
  setShowSharedElectrons: (show) => set({ showSharedElectrons: show }),
}))
