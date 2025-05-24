import React, { useState, useEffect } from 'react';
import { User, GraduationCap, BookOpen, Calendar, Settings, LogOut, Bell, Search, Plus, FileText, Clock, CheckCircle, Users, Edit3, Upload } from 'lucide-react';

const AlunoDashboardIC = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('meus-projetos');
  const [showCadastrarProjeto, setShowCadastrarProjeto] = useState(false);

  // Estados para projetos
  const [meusProjetos, setMeusProjetos] = useState([
    {
      id: 1,
      titulo: "Sistema de Monitoramento Ambiental IoT",
      orientador: "Prof. Dr. Carlos Silva",
      status: "ativo",
      dataSubmissao: "2024-05-15",
      dataAprovacao: "2024-05-18",
      descricao: "Desenvolvimento de sistema IoT para monitoramento de qualidade do ar no campus...",
      documentos: 2,
      ultimaPostagem: "2024-05-20"
    }
  ]);

  // Lista de professores disponíveis
  const [professores, setProfessores] = useState([
    {
      id: 1,
      nome: "Prof. Dr. Ana Santos",
      email: "ana.santos@ibmec.edu.br",
      areas: ["Inteligência Artificial", "Machine Learning", "Análise de Dados"],
      titulacao: "Doutora em Ciência da Computação",
      projetos_ativos: 3
    },
    {
      id: 2,
      nome: "Prof. Dr. Carlos Silva",
      email: "carlos.silva@ibmec.edu.br", 
      areas: ["IoT", "Sistemas Embarcados", "Redes"],
      titulacao: "Doutor em Engenharia Elétrica",
      projetos_ativos: 2
    },
    {
      id: 3,
      nome: "Prof. Dra. Maria Oliveira",
      email: "maria.oliveira@ibmec.edu.br",
      areas: ["Desenvolvimento Web", "UI/UX", "Frontend"],
      titulacao: "Doutora em Design Digital",
      projetos_ativos: 4
    }
  ]);

  const [novoProjeto, setNovoProjeto] = useState({
    titulo: '',
    descricao: '',
    orientador_id: ''
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
        
        if (payload.is_new_user && !localStorage.getItem('welcome_modal_dismissed_aluno')) {
          setShowWelcomeModal(true);
        }
        
        localStorage.setItem('token', token);
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('welcome_modal_dismissed_aluno');
    window.location.href = '/login';
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('welcome_modal_dismissed_aluno', 'true');
  };

  const handleSubmitProjeto = () => {
    if (!novoProjeto.titulo || !novoProjeto.descricao || !novoProjeto.orientador_id) {
      alert('Por favor, preencha todos os campos!');
      return;
    }
    
    const orientador = professores.find(p => p.id === parseInt(novoProjeto.orientador_id));
    
    const projeto = {
      id: Date.now(),
      ...novoProjeto,
      orientador: orientador.nome,
      status: 'pendente',
      dataSubmissao: new Date().toISOString().split('T')[0],
      documentos: 0
    };

    setMeusProjetos(prev => [...prev, projeto]);
    setNovoProjeto({ titulo: '', descricao: '', orientador_id: '' });
    setShowCadastrarProjeto(false);
    alert('Projeto submetido com sucesso! Aguarde a aprovação do orientador.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Token inválido ou expirado</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Portal IC - Aluno</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">Aluno - {user.semestre || 1}º Semestre</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Portal de Iniciação Científica
              </h2>
              <p className="text-green-100">
                Submeta projetos, acompanhe o desenvolvimento e interaja com seu orientador.
              </p>
            </div>
            <GraduationCap className="h-16 w-16 text-green-200" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Projetos</p>
                <p className="text-2xl font-bold text-gray-900">{meusProjetos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Documentos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {meusProjetos.reduce((acc, p) => acc + (p.documentos || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <User className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Matrícula</p>
                <p className="text-lg font-bold text-gray-900">{user.matricula || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Edit3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Perfil</p>
                <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="mb-8">
          <button
            onClick={() => setShowCadastrarProjeto(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Cadastrar Novo Projeto</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('meus-projetos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'meus-projetos'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Meus Projetos ({meusProjetos.length})
              </button>
              <button
                onClick={() => setActiveTab('professores')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'professores'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Professores Disponíveis
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'meus-projetos' && (
              <div className="space-y-4">
                {meusProjetos.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto cadastrado</h3>
                    <p className="text-gray-600 mb-4">Cadastre seu primeiro projeto de iniciação científica!</p>
                    <button
                      onClick={() => setShowCadastrarProjeto(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Cadastrar Projeto
                    </button>
                  </div>
                ) : (
                  meusProjetos.map((projeto) => (
                    <div key={projeto.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{projeto.titulo}</h3>
                          <p className="text-sm text-gray-600">
                            <strong>Orientador:</strong> {projeto.orientador}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Submetido em:</strong> {new Date(projeto.dataSubmissao).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                          projeto.status === 'ativo' 
                            ? 'bg-green-100 text-green-800'
                            : projeto.status === 'pendente'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {projeto.status === 'ativo' ? 'Ativo' : 
                           projeto.status === 'pendente' ? 'Pendente' : projeto.status}
                        </span>
                      </div>
                      
                      {projeto.status === 'ativo' && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {projeto.documentos} documentos
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Última postagem: {new Date(projeto.ultimaPostagem).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {projeto.descricao}
                        </p>
                      </div>

                      <div className="flex space-x-3">
                        {projeto.status === 'ativo' && (
                          <>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                              <Upload className="h-4 w-4" />
                              <span>Upload Documento</span>
                            </button>
                            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                              Ver Projeto
                            </button>
                          </>
                        )}
                        {projeto.status === 'pendente' && (
                          <span className="text-sm text-orange-600">Aguardando aprovação do orientador</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'professores' && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Escolha um orientador</h3>
                  <p className="text-sm text-gray-600">Visualize o perfil e áreas de interesse dos professores disponíveis.</p>
                </div>
                
                {professores.map((professor) => (
                  <div key={professor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{professor.nome}</h3>
                        <p className="text-sm text-gray-600 mb-2">{professor.titulacao}</p>
                        <p className="text-sm text-gray-600">📧 {professor.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">Projetos ativos: {professor.projetos_ativos}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Áreas de Interesse:</h4>
                      <div className="flex flex-wrap gap-2">
                        {professor.areas.map((area, index) => (
                          <span 
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setNovoProjeto(prev => ({ ...prev, orientador_id: professor.id.toString() }));
                        setShowCadastrarProjeto(true);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Escolher como Orientador
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Cadastrar Projeto */}
      {showCadastrarProjeto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cadastrar Novo Projeto</h3>
              <button
                onClick={() => setShowCadastrarProjeto(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Projeto
                </label>
                <input
                  type="text"
                  value={novoProjeto.titulo}
                  onChange={(e) => setNovoProjeto(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Digite o título do seu projeto"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orientador
                </label>
                <select
                  value={novoProjeto.orientador_id}
                  onChange={(e) => setNovoProjeto(prev => ({ ...prev, orientador_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione um orientador</option>
                  {professores.map((professor) => (
                    <option key={professor.id} value={professor.id}>
                      {professor.nome} - {professor.areas.join(', ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição do Projeto
                </label>
                <textarea
                  rows={6}
                  value={novoProjeto.descricao}
                  onChange={(e) => setNovoProjeto(prev => ({ ...prev, descricao: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Descreva detalhadamente seu projeto de iniciação científica..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSubmitProjeto}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submeter Projeto
                </button>
                <button
                  onClick={() => setShowCadastrarProjeto(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <GraduationCap className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bem-vindo ao Portal IC!</h3>
              <p className="text-gray-600 mb-4">
                Portal de Iniciação Científica - submeta projetos e desenvolva sua pesquisa.
              </p>
              <div className="text-left bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Como aluno você pode:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Cadastrar projetos de iniciação científica</li>
                  <li>✅ Escolher orientadores por área de interesse</li>
                  <li>✅ Fazer upload de documentos e relatórios</li>
                  <li>✅ Acompanhar feedback do orientador</li>
                </ul>
              </div>
              <button 
                onClick={handleCloseWelcomeModal}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Começar a usar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlunoDashboardIC;