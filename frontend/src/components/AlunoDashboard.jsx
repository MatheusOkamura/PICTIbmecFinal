import React, { useState, useEffect, useCallback } from 'react';
import { User, GraduationCap, BookOpen, Calendar, LogOut, Bell, Plus, FileText, Edit3, Upload } from 'lucide-react';

const AlunoDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('meus-projetos');
  const [showCadastrarProjeto, setShowCadastrarProjeto] = useState(false);
  const [inscricaoPeriodo, setInscricaoPeriodo] = useState({ data_limite: '', aberto: true });

  // Estados para projetos
  const [meusProjetos, setMeusProjetos] = useState([]);
  const [professores, setProfessores] = useState([]);

  const [novoProjeto, setNovoProjeto] = useState({
    titulo: '',
    descricao: '',
    orientador_id: ''
  });

  // Função para fazer requisições autenticadas
  const fetchAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  };
  // Carregar dados iniciais
  const carregarPeriodoInscricao = useCallback(async () => {
    try {
      const res = await fetchAuth('http://localhost:8000/api/v1/projetos/inscricao-periodo');
      if (res.ok) {
        setInscricaoPeriodo(await res.json());
      }
    } catch (e) {}
  }, []);

  const carregarDados = useCallback(async () => {
    try {
      // Carregar meus projetos
      const projetosRes = await fetchAuth('http://localhost:8000/api/v1/projetos/meus-projetos');
      if (projetosRes.ok) {
        const projetos = await projetosRes.json();
        setMeusProjetos(projetos);
      }

      // Carregar professores
      const professoresRes = await fetchAuth('http://localhost:8000/api/v1/projetos/orientadores');
      if (professoresRes.ok) {
        const profs = await professoresRes.json();
        setProfessores(profs);
      }

      // Carregar período de inscrição
      carregarPeriodoInscricao();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, [carregarPeriodoInscricao]);

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
        
        // Carregar dados da API
        carregarDados();
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }    } else {
      carregarDados();
    }
    setLoading(false);  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('welcome_modal_dismissed_aluno');
    window.location.href = '/login';
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('welcome_modal_dismissed_aluno', 'true');
  };

  const handleSubmitProjeto = async () => {
    if (!novoProjeto.titulo || !novoProjeto.descricao || !novoProjeto.orientador_id) {
      alert('Por favor, preencha todos os campos!');
      return;
    }
    
    try {
      const response = await fetchAuth('http://localhost:8000/api/v1/projetos/cadastrar', {
        method: 'POST',
        body: JSON.stringify({
          titulo: novoProjeto.titulo,
          descricao: novoProjeto.descricao,
          orientador_id: parseInt(novoProjeto.orientador_id)
        })
      });

      if (response.ok) {
        alert('Projeto submetido com sucesso! Aguarde a aprovação do orientador.');
        setNovoProjeto({ titulo: '', descricao: '', orientador_id: '' });
        setShowCadastrarProjeto(false);
        carregarDados(); // Recarregar projetos
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro ao submeter projeto:', error);
      alert('Erro ao submeter projeto. Tente novamente.');
    }
  };

  const abrirEditarPerfil = () => {
    window.location.href = '/aluno/editar-perfil';
  };

  // Verifica se pode cadastrar projeto
  const podeCadastrarProjeto = (() => {
    if (!inscricaoPeriodo.aberto) return false;
    if (!inscricaoPeriodo.data_limite) return true;
    try {
      return new Date() <= new Date(inscricaoPeriodo.data_limite);
    } catch {
      return true;
    }
  })();

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
                  {meusProjetos.reduce((acc, p) => acc + (p.documentos_count || 0), 0)}
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
                <button 
                  onClick={abrirEditarPerfil}
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="mb-8">
          <button
            onClick={() => podeCadastrarProjeto && setShowCadastrarProjeto(true)}
            className={`px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors
              ${podeCadastrarProjeto
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
            disabled={!podeCadastrarProjeto}
            title={
              podeCadastrarProjeto
                ? 'Cadastrar novo projeto'
                : 'Inscrições encerradas no momento'
            }
          >
            <Plus className="h-5 w-5" />
            <span>Cadastrar Novo Projeto</span>
          </button>
          {!podeCadastrarProjeto && (
            <div className="text-sm text-red-700 mt-2">
              Inscrições encerradas no momento. Aguarde a abertura do próximo período.
            </div>
          )}
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
                      onClick={() => podeCadastrarProjeto && setShowCadastrarProjeto(true)}
                      className={`bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors ${
                        !podeCadastrarProjeto ? 'bg-gray-200 text-gray-400 hover:bg-gray-200 cursor-not-allowed' : ''
                      }`}
                      disabled={!podeCadastrarProjeto}
                      title={
                        podeCadastrarProjeto
                          ? 'Cadastrar novo projeto'
                          : 'Inscrições encerradas no momento'
                      }
                    >
                      Cadastrar Projeto
                    </button>
                    {!podeCadastrarProjeto && (
                      <div className="text-sm text-red-700 mt-2">
                        Inscrições encerradas no momento. Aguarde a abertura do próximo período.
                      </div>
                    )}
                  </div>
                ) : (
                  meusProjetos.map((projeto) => (
                    <div key={projeto.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{projeto.titulo}</h3>
                          <p className="text-sm text-gray-600">
                            <strong>Orientador:</strong> {projeto.orientador_nome}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Submetido em:</strong> {new Date(projeto.data_submissao).toLocaleDateString()}
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
                              {projeto.documentos_count || 0} documentos
                            </span>
                            {projeto.ultima_postagem && (
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Última postagem: {new Date(projeto.ultima_postagem).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {projeto.descricao}
                        </p>
                      </div>

                      {/* Atividades do Projeto */}
                      {projeto.atividades && projeto.atividades.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 mt-4">
                          <h4 className="text-sm font-semibold text-blue-900 mb-2">Atividades para Entrega</h4>
                          <ul className="space-y-2">
                            {projeto.atividades.map((atv) => (
                              <li key={atv.id} className="border-b border-blue-100 pb-2 mb-2 last:border-b-0 last:mb-0">
                                <div className="font-medium text-blue-800">{atv.titulo}</div>
                                <div className="text-sm text-blue-700">{atv.descricao}</div>
                                <div className="text-xs text-blue-400">
                                  Criada em: {new Date(atv.data_criacao).toLocaleDateString()}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        {projeto.status === 'ativo' && (
                          <>
                            <button 
                              onClick={() => window.location.href = `/projeto/${projeto.id}/documentos`}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Upload Documento</span>
                            </button>
                            <button 
                              onClick={() => window.location.href = `/projeto/${projeto.id}`}
                              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Ver Projeto
                            </button>
                            <button
                              onClick={() => window.location.href = `/projeto/${projeto.id}/documentos#atividades`}
                              className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-2"
                            >
                              <FileText className="h-4 w-4" />
                              <span>Ver Atividades</span>
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
                        {professor.areas && professor.areas.map((area, index) => (
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
                        if (podeCadastrarProjeto) {
                          setNovoProjeto(prev => ({ ...prev, orientador_id: professor.id.toString() }));
                          setShowCadastrarProjeto(true);
                        }
                      }}
                      className={`bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors ${
                        !podeCadastrarProjeto ? 'bg-gray-200 text-gray-400 hover:bg-gray-200 cursor-not-allowed' : ''
                      }`}
                      disabled={!podeCadastrarProjeto}
                      title={
                        podeCadastrarProjeto
                          ? 'Escolher este orientador'
                          : 'Inscrições encerradas no momento'
                      }
                    >
                      Escolher como Orientador
                    </button>
                    {!podeCadastrarProjeto && (
                      <div className="text-sm text-red-700 mt-2">
                        Inscrições encerradas no momento. Aguarde a abertura do próximo período.
                      </div>
                    )}
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
                      {professor.nome} - {professor.area_pesquisa}
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
            </div>          </div>
        </div>
      )}
    </div>
  );
};

export default AlunoDashboard;