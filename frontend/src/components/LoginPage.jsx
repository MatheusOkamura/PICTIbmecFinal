import React from 'react';
import { GraduationCap, LogIn, Shield, Users, BookOpen } from 'lucide-react';

const LoginPage = () => {
  const handleMicrosoftLogin = () => {
    // Redirecionar para o endpoint de login da Microsoft
    window.location.href = 'http://localhost:8000/api/v1/auth/microsoft-login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center">
              <GraduationCap className="h-16 w-16 text-blue-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Portal IBMEC
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sistema de Gestão PICT
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Faça login com sua conta IBMEC
                </h3>
                <p className="text-sm text-gray-600">
                  Use sua conta do Ibmec
                </p>
              </div>

              {/* Microsoft Login Button */}
              <button
                onClick={handleMicrosoftLogin}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LogIn className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                </span>
                Entrar com Microsoft
              </button>

              {/* Help Text */}
             {/*  <div className="text-center">
                <p className="text-xs text-gray-500">
                  Problemas para acessar?{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    Entre em contato com o suporte
                  </a>
                </p>
              </div> */}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                O que você pode fazer no portal:
              </h4>
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                <div className="flex flex-col items-center">
                  <Shield className="h-6 w-6 text-blue-600 mb-2" />
                  <span>Acesso Seguro</span>
                </div>
                <div className="flex flex-col items-center">
                  <Users className="h-6 w-6 text-green-600 mb-2" />
                  <span>Orientações</span>
                </div>
                <div className="flex flex-col items-center">
                  <BookOpen className="h-6 w-6 text-purple-600 mb-2" />
                  <span>Projetos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              © 2025 IBMEC. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;