import { create } from 'zustand'
import {
  detectBonds,
  breakBonds,
  getConnectedComponent,
  type PlacedAtom,
  type BuilderBond,
} from '../algorithms/bondEngine'

let nextId = 0

function saveHistory(state: {
  placedAtoms: PlacedAtom[]
  bonds: BuilderBond[]
  history: { atoms: PlacedAtom[]; bonds: BuilderBond[] }[]
}) {
  return [...state.history, {
    atoms: state.placedAtoms.map(a => ({ ...a })),
    bonds: state.bonds.map(b => ({ ...b })),
  }]
}

interface BuilderState {
  placedAtoms: PlacedAtom[]
  bonds: BuilderBond[]
  selectedAtomId: number | null
  moleculeAtomIds: number[] | null
  activeElement: string | null
  history: { atoms: PlacedAtom[]; bonds: BuilderBond[] }[]

  placeAtom: (element: string, position: [number, number, number]) => void
  removeAtom: (id: number) => void
  moveAtom: (id: number, position: [number, number, number]) => void
  moveGroup: (draggedId: number, position: [number, number, number]) => void
  selectAtom: (id: number | null) => void
  selectMolecule: (id: number) => void
  setActiveElement: (el: string | null) => void
  clearAll: () => void
  undoLast: () => void
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  placedAtoms: [],
  bonds: [],
  selectedAtomId: null,
  moleculeAtomIds: null,
  activeElement: null,
  history: [],

  placeAtom: (element, position) => {
    const state = get()
    const newAtom: PlacedAtom = { id: nextId++, element, position }
    const newAtoms = [...state.placedAtoms, newAtom]
    const newBonds = detectBonds(newAtoms, state.bonds)
    set({
      placedAtoms: newAtoms,
      bonds: newBonds,
      activeElement: null,
      selectedAtomId: null,
      moleculeAtomIds: null,
      history: saveHistory(state),
    })
  },

  removeAtom: (id) => {
    const state = get()
    const newAtoms = state.placedAtoms.filter(a => a.id !== id)
    const newBonds = state.bonds.filter(b => b.from !== id && b.to !== id)
    set({
      placedAtoms: newAtoms,
      bonds: newBonds,
      selectedAtomId: state.selectedAtomId === id ? null : state.selectedAtomId,
      moleculeAtomIds: state.moleculeAtomIds?.includes(id) ? null : state.moleculeAtomIds,
      history: [...state.history, { atoms: state.placedAtoms, bonds: state.bonds }],
    })
  },

  moveAtom: (id, position) => {
    const state = get()
    const newAtoms = state.placedAtoms.map(a =>
      a.id === id ? { ...a, position } : a
    )
    const brokenBonds = breakBonds(newAtoms, state.bonds)
    const newBonds = detectBonds(newAtoms, brokenBonds)
    set({ placedAtoms: newAtoms, bonds: newBonds })
  },

  moveGroup: (draggedId, position) => {
    const state = get()
    const ids = state.moleculeAtomIds
    if (!ids) {
      state.moveAtom(draggedId, position)
      return
    }
    const dragged = state.placedAtoms.find(a => a.id === draggedId)
    if (!dragged) return
    const dx = position[0] - dragged.position[0]
    const dy = position[1] - dragged.position[1]
    const dz = position[2] - dragged.position[2]
    if (dx === 0 && dy === 0 && dz === 0) return

    const newAtoms = state.placedAtoms.map(a =>
      ids.includes(a.id)
        ? { ...a, position: [a.position[0] + dx, a.position[1] + dy, a.position[2] + dz] as [number, number, number] }
        : a
    )
    const brokenBonds = breakBonds(newAtoms, state.bonds)
    const newBonds = detectBonds(newAtoms, brokenBonds)
    set({ placedAtoms: newAtoms, bonds: newBonds })
  },

  selectAtom: (id) => set({ selectedAtomId: id, moleculeAtomIds: null }),

  selectMolecule: (id) => {
    const state = get()
    const ids = getConnectedComponent(id, state.placedAtoms, state.bonds)
    set({
      moleculeAtomIds: ids.length > 1 ? ids : null,
      selectedAtomId: id,
    })
  },

  setActiveElement: (el) => set({ activeElement: el }),

  clearAll: () => {
    const state = get()
    set({
      placedAtoms: [],
      bonds: [],
      selectedAtomId: null,
      moleculeAtomIds: null,
      activeElement: null,
      history: saveHistory(state),
    })
  },

  undoLast: () => {
    const state = get()
    if (state.history.length === 0) return
    const prev = state.history[state.history.length - 1]
    set({
      placedAtoms: prev.atoms,
      bonds: prev.bonds,
      selectedAtomId: null,
      moleculeAtomIds: null,
      history: state.history.slice(0, -1),
    })
  },
}))
