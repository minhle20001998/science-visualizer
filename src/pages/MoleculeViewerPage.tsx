import { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { getMolecule, MOLECULES } from '../data/molecules'
import { Molecule } from '../components/molecule/Molecule'
import { MoleculeInfo } from '../components/molecule/MoleculeInfo'
import { useStore } from '../store/useStore'

function MoleculeScene({ molId }: { molId: string }) {
  const mol = getMolecule(molId)
  const moleculeViewMode = useStore((s) => s.moleculeViewMode)
  const showSharedElectrons = useStore((s) => s.showSharedElectrons)

  if (!mol) return null

  return (
    <>
      <color attach="background" args={['#08080e']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#4af0ff" />
      <Molecule
        elements={mol.elements}
        bonds={mol.bonds}
        geometry={mol.geometry}
        spaceFill={moleculeViewMode === 'space-filling'}
        showElectrons={showSharedElectrons}
      />
      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={15}
        enableDamping
        dampingFactor={0.1}
      />
    </>
  )
}

export function MoleculeViewerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const moleculeViewMode = useStore((s) => s.moleculeViewMode)
  const showSharedElectrons = useStore((s) => s.showSharedElectrons)
  const setMoleculeViewMode = useStore((s) => s.setMoleculeViewMode)
  const setShowSharedElectrons = useStore((s) => s.setShowSharedElectrons)

  const mol = id ? getMolecule(id) : undefined

  const currentIndex = useMemo(() => {
    if (!id) return -1
    return MOLECULES.findIndex((m) => m.id === id)
  }, [id])

  const prevId = currentIndex > 0 ? MOLECULES[currentIndex - 1].id : null
  const nextId = currentIndex < MOLECULES.length - 1 ? MOLECULES[currentIndex + 1].id : null

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && prevId) {
        navigate(`/molecule/${prevId}`)
      } else if (e.key === 'ArrowRight' && nextId) {
        navigate(`/molecule/${nextId}`)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [prevId, nextId, navigate])

  if (!mol) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#08080e', color: 'var(--text-dim)',
        gap: '16px',
      }}>
        <div>Molecule not found</div>
        <button onClick={() => navigate('/molecule')}
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            padding: '8px 16px',
            color: 'var(--text-dim)',
            fontSize: '12px',
            cursor: 'pointer',
          }}>
          ← Back to list
        </button>
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#08080e' }}>
      <Canvas gl={{ antialias: true, alpha: false }} style={{ width: '100%', height: '100%' }}>
        <MoleculeScene molId={id!} />
      </Canvas>

      <MoleculeInfo mol={mol} />

      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--card-bg)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--card-border)',
        borderRadius: '10px',
        padding: '0 16px',
        height: '56px',
        gap: '12px',
      }}>
        <div style={{ width: '60px', display: 'flex', justifyContent: 'flex-start' }}>
          <button onClick={() => navigate('/molecule')} style={{
            background: 'none', border: 'none', color: 'var(--text-dim)',
            fontSize: '12px', cursor: 'pointer', padding: 0,
          }}>
            ← Back
          </button>
        </div>
        <div style={{ width: '1px', height: '20px', background: 'var(--card-border)' }} />
        <div style={{ width: '200px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#eeeeee', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {mol.formula}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {mol.name}
          </div>
        </div>
        <div style={{ width: '1px', height: '20px', background: 'var(--card-border)' }} />
        <div style={{ width: '72px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => prevId && navigate(`/molecule/${prevId}`)}
            disabled={!prevId}
            style={{
              background: prevId ? 'rgba(255,255,255,0.06)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              color: prevId ? 'var(--text)' : 'rgba(255,255,255,0.2)',
              fontSize: '13px',
              cursor: prevId ? 'pointer' : 'default',
            }}
          >
            ◀
          </button>
          <button
            onClick={() => nextId && navigate(`/molecule/${nextId}`)}
            disabled={!nextId}
            style={{
              background: nextId ? 'rgba(255,255,255,0.06)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              color: nextId ? 'var(--text)' : 'rgba(255,255,255,0.2)',
              fontSize: '13px',
              cursor: nextId ? 'pointer' : 'default',
            }}
          >
            ▶
          </button>
        </div>
      </div>

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
        <label style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '11px', color: 'var(--text-dim)', cursor: 'pointer',
          userSelect: 'none',
        }}>
          <input
            type="checkbox"
            checked={moleculeViewMode === 'space-filling'}
            onChange={() => setMoleculeViewMode(moleculeViewMode === 'ball-and-stick' ? 'space-filling' : 'ball-and-stick')}
            style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          Space-fill
        </label>
        <label style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '11px', color: 'var(--text-dim)', cursor: 'pointer',
          userSelect: 'none',
        }}>
          <input
            type="checkbox"
            checked={showSharedElectrons}
            onChange={() => setShowSharedElectrons(!showSharedElectrons)}
            style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          Electron pairs
        </label>
      </div>
    </div>
  )
}
