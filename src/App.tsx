import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { AtomVisualizerPage } from './pages/AtomVisualizerPage'
import { MoleculeHomePage } from './pages/MoleculeHomePage'
import { MoleculeViewerPage } from './pages/MoleculeViewerPage'
import { MoleculeBuilderPage } from './pages/MoleculeBuilderPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/atom" element={<AtomVisualizerPage />} />
      <Route path="/molecule" element={<MoleculeHomePage />} />
      <Route path="/molecule/:id" element={<MoleculeViewerPage />} />
      <Route path="/builder" element={<MoleculeBuilderPage />} />
    </Routes>
  )
}

export default App
