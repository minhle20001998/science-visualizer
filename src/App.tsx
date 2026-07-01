import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { AtomVisualizerPage } from './pages/AtomVisualizerPage'
import { MoleculeHomePage } from './pages/MoleculeHomePage'
import { MoleculeViewerPage } from './pages/MoleculeViewerPage'
import { MoleculeBuilderPage } from './pages/MoleculeBuilderPage'
import { SimulationListPage } from './pages/SimulationListPage'
import { SimulationPlayerPage } from './pages/SimulationPlayerPage'
import { ElectronicsPage } from './pages/ElectronicsPage'
import { NmosPage } from './pages/NmosPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/atom" element={<AtomVisualizerPage />} />
      <Route path="/molecule" element={<MoleculeHomePage />} />
      <Route path="/molecule/:id" element={<MoleculeViewerPage />} />
      <Route path="/builder" element={<MoleculeBuilderPage />} />
      <Route path="/biology" element={<SimulationListPage />} />
      <Route path="/biology/rna" element={<SimulationPlayerPage />} />
      <Route path="/electronics" element={<ElectronicsPage />} />
      <Route path="/electronics/nmos" element={<NmosPage />} />
    </Routes>
  )
}

export default App
