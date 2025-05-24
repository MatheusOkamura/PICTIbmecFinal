import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import ProfessorDashboard from './components/ProfessorDashboard';
import AlunoDashboard from './components/AlunoDashboard';
import Home from './components/Home';
import AlunoDashboardIC from './components/AlunoDashboard';
import ProfessorDashboardIC from './components/ProfessorDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
          <Route path="/aluno/dashboard" element={<AlunoDashboard />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;