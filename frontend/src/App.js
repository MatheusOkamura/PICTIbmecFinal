// App.js ou onde estão suas rotas React
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PortalICLanding from './components/Home';
import LoginPage from './components/LoginPage';
import AlunoDashboard from './components/AlunoDashboard';
import ProfessorDashboardIC from './components/ProfessorDashboard';
import AdminDashboardIC from './components/AdminDashboard';
import EditarPerfilAluno from './components/EditarPerfilAluno';
import EditarPerfilProfessor from './components/EditarPerfilProfessor';
import DocumentosProjeto from './components/DocumentosProjeto';
import ProjetosAnteriores from './components/ProjetosAnteriores';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortalICLanding />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/aluno/dashboard" 
          element={
            <ProtectedRoute requiredRole="aluno">
              <AlunoDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/aluno/editar-perfil" 
          element={
            <ProtectedRoute requiredRole="aluno">
              <EditarPerfilAluno />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/professor/dashboard" 
          element={
            <ProtectedRoute requiredRole="professor">
              <ProfessorDashboardIC />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/professor/editar-perfil" 
          element={
            <ProtectedRoute requiredRole="professor">
              <EditarPerfilProfessor />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projeto/:id" 
          element={
            <ProtectedRoute>
              <DocumentosProjeto />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projeto/:id/documentos" 
          element={
            <ProtectedRoute>
              <DocumentosProjeto />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/adminDashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardIC />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edicoes-anteriores" 
          element={
            <ProtectedRoute>
              <ProjetosAnteriores />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;