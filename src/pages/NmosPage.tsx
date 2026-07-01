import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { ChipView } from '../components/electronics/ChipView'
import { Schematic2D } from '../components/electronics/Schematic2D'
import { TransistorControls } from '../components/electronics/TransistorControls'
import { isChannelFormed } from '../algorithms/transistorPhysics'

export function NmosPage() {
  const navigate = useNavigate()
  const [vgs, setVgs] = useState(0)
  const [vds, setVds] = useState(3)
  const [showDepletion, setShowDepletion] = useState(true)
  const [showBands, setShowBands] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const isOn = isChannelFormed(vgs)

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#08080e' }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/electronics')}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 20,
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          color: 'var(--text-dim)', fontSize: 12, padding: '6px 12px',
          borderRadius: 6, cursor: 'pointer',
        }}
      >
        ← Back
      </button>

      {/* Help icon with tooltip */}
      <div style={{
        position: 'fixed', top: 16, right: 22, zIndex: 30,
        cursor: 'pointer', userSelect: 'none',
      }} onClick={() => setShowHelp(s => !s)}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: showHelp ? 'rgba(0,238,255,0.15)' : 'var(--card-bg)',
          border: showHelp ? '1px solid rgba(0,238,255,0.4)' : '1px solid var(--card-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: showHelp ? '#0ee' : '#999', fontSize: 18, fontWeight: 700,
          transition: 'all 0.15s',
        }}>
          ?
        </div>
        {showHelp && (
        <div style={{
          position: 'absolute', top: 42, right: 0, width: 360,
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: 10, padding: 16, fontSize: 12, color: '#ccc',
          lineHeight: 1.7, maxHeight: '70vh', overflowY: 'auto',
        }}>
          <div style={{ fontWeight: 600, color: '#eee', marginBottom: 8, fontSize: 13 }}>NMOS Transistor Operation</div>
          <p style={{ margin: 0 }}>
            The N+ Source and Drain are heavily doped (free electrons). The P- substrate (majority holes — empty "sockets" for electrons) contains positive charge carriers.
          </p>
          <p style={{ margin: '8px 0' }}>
            When Gate voltage V<sub>GS</sub> is below threshold (2V): Gate is neutral. Source emits electrons, but they are absorbed by holes in the P- substrate. The Source-leaving electrons fit into those holes — no path to Drain.
          </p>
          <p style={{ margin: '8px 0' }}>
            A depletion barrier (red) forms at the Source/P- junction, preventing electrons from advancing — Source and Drain are isolated, switch is OFF.
          </p>
          <p style={{ margin: '8px 0' }}>
            When V<sub>GS</sub> ≥ 2V: The gate glows yellow (positive charge). The field pushes holes down into the substrate. Electrons previously occupying holes rise toward the gate interface, forming an inversion layer that connects Source to Drain.
          </p>
          <p style={{ margin: '8px 0' }}>
            The channel (cyan glow) bridges Source-Drain. When Drain voltage V&lt;sub&gt;DS&lt;/sub&gt; &gt; 0: electrons flow from Source to Drain — the NMOS is ON.
          </p>
          <p style={{ margin: '8px 0 0' }}>
            Toggle "Depletion" to show Source/Drain PN junction depletion (red boxes).
          </p>
        </div>
        )}
      </div>

      {/* Title */}
      <div style={{
        position: 'fixed', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
        fontSize: 16, fontWeight: 600, color: '#eee',
      }}>
        NMOS Transistor
      </div>

      {/* Split layout */}
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        {/* Left: 2D Schematic */}
        <div style={{
          width: '35%', height: '100%', padding: '60px 20px 100px 20px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <Schematic2D vgs={vgs} vds={vds} isOn={isOn} />
        </div>

        {/* Right: 3D Chip View */}
        <div style={{ width: '65%', height: '100%' }}>
          <Canvas>
            <color attach="background" args={['#08080e']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 5]} intensity={0.8} />
            <directionalLight position={[-3, 2, -5]} intensity={0.3} />
            <PerspectiveCamera makeDefault position={[5, 4, 6]} fov={35} />
            <ChipView vgs={vgs} vds={vds} showDepletion={showDepletion} />
            <OrbitControls enablePan minDistance={3} maxDistance={15} target={[0, 0, 0]} />
          </Canvas>
        </div>
      </div>

      {/* Controls at bottom */}
      <div style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
        width: '90%', maxWidth: 900,
      }}>
        <TransistorControls
          vgs={vgs} vds={vds}
          showDepletion={showDepletion} showBands={showBands}
          onVgsChange={setVgs}
          onVdsChange={setVds}
          onDepletionToggle={() => setShowDepletion(d => !d)}
          onBandsToggle={() => setShowBands(b => !b)}
        />
      </div>

      {/* Info overlay */}
      <div style={{
        position: 'fixed', bottom: 100, right: 24, zIndex: 20,
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: 10, padding: '12px 16px', fontSize: 12, color: 'var(--text-dim)',
        lineHeight: 1.6, minWidth: 140,
      }}>
        <div style={{ fontWeight: 600, color: '#eee', marginBottom: 4 }}>State</div>
        <div>Channel: <span style={{ color: isOn ? '#00ffee' : '#888' }}>{isOn ? 'ON' : 'OFF'}</span></div>
        <div>V<sub>GS</sub> = {vgs.toFixed(1)}V</div>
        <div>V<sub>DS</sub> = {vds.toFixed(1)}V</div>
      </div>
    </div>
  )
}
