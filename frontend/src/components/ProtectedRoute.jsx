import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        // Verificar se o token expirou
        if (payload.exp && payload.exp < currentTime) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        // Verificar se o usuário tem o papel necessário
        if (requiredRole && payload.user_type !== requiredRole) {
          // Redirecionar para o dashboard apropriado
          switch (payload.user_type) {
            case 'admin':
              navigate('/adminDashboard');
              break;
            case 'professor':
              navigate('/professor/dashboard');
              break;
            case 'aluno':
              navigate('/aluno/dashboard');
              break;
            default:
              navigate('/login');
          }
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
