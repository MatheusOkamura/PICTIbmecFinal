// App.js ou onde estão suas rotas React
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PortalICLanding from './components/Home';
import LoginPage from './components/LoginPage';
import AlunoDashboardIC from './components/AlunoDashboard';
import ProfessorDashboardIC from './components/ProfessorDashboard';
import AdminDashboardIC from './components/AdminDashboard';
import EditarPerfilAluno from './components/EditarPerfilAluno';
import EditarPerfilProfessor from './components/EditarPerfilProfessor';
import DocumentosProjeto from './components/DocumentosProjeto';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortalICLanding />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/aluno/dashboard" element={<AlunoDashboardIC />} />
        <Route path="/aluno/editar-perfil" element={<EditarPerfilAluno />} />
        <Route path="/professor/dashboard" element={<ProfessorDashboardIC />} />
        <Route path="/professor/editar-perfil" element={<EditarPerfilProfessor />} />
        <Route path="/projeto/:id" element={<DocumentosProjeto />} />
        <Route path="/projeto/:id/documentos" element={<DocumentosProjeto />} />
        <Route path="/adminDashboard" element={<AdminDashboardIC />} />
      </Routes>
    </Router>
  );
}

export default App;