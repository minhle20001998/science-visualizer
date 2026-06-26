import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { useBuilderStore } from '../store/useBuilderStore'
import { PlacedAtom } from '../components/molecule/builder/PlacedAtom'
import { AtomPalette } from '../components/molecule/builder/AtomPalette'
import { BondIndicator } from '../components/molecule/builder/BondIndicator'
import { getFormula, validateMolecule } from '../algorithms/bondEngine'
import { Bond } from '../components/molecule/Bond'

const placementPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

function CameraRef({ onReady }: { onReady: (camera: THREE.Camera) => void }) {
  const { camera } = useThree()
  useEffect(() => { onReady(camera) }, [camera, onReady])
  return null
}

function BuilderScene({ onCameraReady }: { onCameraReady: (c: THREE.Camera) => void }) {
  const placedAtoms = useBuilderStore((s) => s.placedAtoms)
  const bonds = useBuilderStore((s) => s.bonds)
  const selectedAtomId = useBuilderStore((s) => s.selectedAtomId)
  const moleculeAtomIds = useBuilderStore((s) => s.moleculeAtomIds)
  const moveAtom = useBuilderStore((s) => s.moveAtom)
  const moveGroup = useBuilderStore((s) => s.moveGroup)
  const selectAtom = useBuilderStore((s) => s.selectAtom)
  const selectMolecule = useBuilderStore((s) => s.selectMolecule)
  const setActiveElement = useBuilderStore((s) => s.setActiveElement)
  const controlsRef = useRef<any>(null)

  const handleMove = (id: number, pos: [number, number, number]) => {
    if (moleculeAtomIds && moleculeAtomIds.length > 1 && moleculeAtomIds.includes(id)) {
      moveGroup(id, pos)
    } else {
      moveAtom(id, pos)
    }
  }

  const handleDragStart = () => {
    if (controlsRef.current) controlsRef.current.enabled = false
  }

  const handleDragEnd = () => {
    if (controlsRef.current) controlsRef.current.enabled = true
    setActiveElement(null)
  }

  return (
    <>
      <color attach="background" args={['#08080e']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#4af0ff" />

      <CameraRef onReady={onCameraReady} />

      <Grid
        position={[0, -0.01, 0]}
        args={[30, 30]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#3a3a5e"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#5a5a8e"
        fadeDistance={25}
        infiniteGrid
      />

      <BondIndicator atoms={placedAtoms} bonds={bonds} />

      {placedAtoms.map((atom) => {
        const isSelected = selectedAtomId === atom.id
        const isInMolecule = !isSelected && moleculeAtomIds !== null && moleculeAtomIds.includes(atom.id)
        return (
          <PlacedAtom
            key={atom.id}
            id={atom.id}
            element={atom.element}
            position={atom.position}
            isSelected={isSelected}
            isInMolecule={isInMolecule}
            bonds={bonds}
            onClick={() => selectAtom(isSelected ? null : atom.id)}
            onMove={(pos) => handleMove(atom.id, pos)}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDoubleClick={() => selectMolecule(atom.id)}
          />
        )
      })}

      {bonds.map((bond, i) => {
        const fromAtom = placedAtoms.find(a => a.id === bond.from)
        const toAtom = placedAtoms.find(a => a.id === bond.to)
        if (!fromAtom || !toAtom) return null
        return (
          <Bond
            key={i}
            start={new THREE.Vector3(...fromAtom.position)}
            end={new THREE.Vector3(...toAtom.position)}
            bondType={1}
          />
        )
      })}

      <OrbitControls
        ref={controlsRef}
        enablePan
        minDistance={2}
        maxDistance={30}
        enableDamping
        dampingFactor={0.1}
      />
    </>
  )
}

const mouseNdc = { x: 0, y: 0 }

export function MoleculeBuilderPage() {
  const navigate = useNavigate()
  const placedAtoms = useBuilderStore((s) => s.placedAtoms)
  const bonds = useBuilderStore((s) => s.bonds)
  const clearAll = useBuilderStore((s) => s.clearAll)
  const undoLast = useBuilderStore((s) => s.undoLast)
  const history = useBuilderStore((s) => s.history)
  const selectedAtomId = useBuilderStore((s) => s.selectedAtomId)
  const moleculeAtomIds = useBuilderStore((s) => s.moleculeAtomIds)
  const removeAtom = useBuilderStore((s) => s.removeAtom)
  const selectAtom = useBuilderStore((s) => s.selectAtom)
  const placeAtom = useBuilderStore((s) => s.placeAtom)
  const activeElement = useBuilderStore((s) => s.activeElement)

  const [cameraRef, setCameraRef] = useState<THREE.Camera | null>(null)

  const formula = getFormula(placedAtoms, bonds)
  const errors = validateMolecule(placedAtoms, bonds)
  const overfillErrors = errors.filter(e => e.type === 'overfilled')

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseNdc.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseNdc.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAtomId !== null) {
        removeAtom(selectedAtomId)
      }
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault()
        undoLast()
      }
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault()
        clearAll()
      }
      if (e.key === 'Escape') {
        selectAtom(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedAtomId, removeAtom, clearAll, undoLast, selectAtom])

  const handlePointerMissed = () => {
    if (!activeElement || !cameraRef) return
    const ray = new THREE.Raycaster()
    ray.setFromCamera(new THREE.Vector2(mouseNdc.x, mouseNdc.y), cameraRef)
    const point = new THREE.Vector3()
    if (ray.ray.intersectPlane(placementPlane, point)) {
      placeAtom(activeElement, [point.x, point.y, point.z])
    }
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      background: '#08080e',
    }}>
      <Canvas
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%' }}
        onPointerMissed={handlePointerMissed}
      >
        <BuilderScene onCameraReady={setCameraRef} />
      </Canvas>

      <AtomPalette />

      {/* Top bar */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        background: 'var(--card-bg)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--card-border)',
        borderRadius: '10px',
        padding: '10px 18px',
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none', color: 'var(--text-dim)',
          fontSize: '12px', cursor: 'pointer', padding: 0,
        }}>
          ← Back
        </button>
        <div style={{ width: '1px', height: '20px', background: 'var(--card-border)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#eeeeee' }}>
            Molecule Builder
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
            {placedAtoms.length} atom{placedAtoms.length !== 1 ? 's' : ''} · {bonds.length} bond{bonds.length !== 1 ? 's' : ''}
            {moleculeAtomIds && moleculeAtomIds.length > 1 && (
              <span style={{ marginLeft: '8px', color: '#4af0ff', fontSize: '10px' }}>
                · group selected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        background: 'var(--card-bg)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--card-border)',
        borderRadius: '10px',
        padding: '10px 18px',
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 700,
          color: formula ? '#eeeeee' : 'var(--text-dim)',
          fontVariantNumeric: 'tabular-nums',
          minWidth: '80px',
          textAlign: 'center',
        }}>
          {formula || '—'}
        </div>
        <div style={{ width: '1px', height: '24px', background: 'var(--card-border)' }} />

        <button
          onClick={undoLast}
          disabled={history.length === 0}
          style={{
            border: '1px solid var(--card-border)',
            borderRadius: '6px',
            padding: '5px 12px',
            fontSize: '11px',
            cursor: history.length > 0 ? 'pointer' : 'default',
            color: history.length > 0 ? 'var(--text)' : 'rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          ↶ Undo
        </button>
        <button
          onClick={clearAll}
          disabled={placedAtoms.length === 0}
          style={{
            border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: '6px',
            padding: '5px 12px',
            fontSize: '11px',
            cursor: placedAtoms.length > 0 ? 'pointer' : 'default',
            color: placedAtoms.length > 0 ? '#ff6b6b' : 'rgba(255,80,80,0.3)',
            background: placedAtoms.length > 0 ? 'rgba(255,80,80,0.08)' : 'transparent',
          }}
        >
          ✕ Clear
        </button>
      </div>

      {/* Error toast */}
      {overfillErrors.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 60,
          background: 'rgba(255, 60, 60, 0.15)',
          border: '1px solid rgba(255, 60, 60, 0.3)',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '11px',
          color: '#ff6b6b',
          backdropFilter: 'blur(8px)',
        }}>
          {overfillErrors[0].message}
        </div>
      )}

      {/* Empty state hint */}
      {placedAtoms.length === 0 && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 40,
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '13px',
          pointerEvents: 'none',
          opacity: 0.6,
        }}>
          Pick an atom from the palette, then click the grid to place it
        </div>
      )}
    </div>
  )
}
