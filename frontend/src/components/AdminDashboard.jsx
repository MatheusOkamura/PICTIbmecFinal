import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, BookOpen, Calendar, LogOut, Bell, CheckCircle, Clock, Edit3, FileText, Edit } from 'lucide-react';
import EditarPerfilProfessor from './EditarPerfilProfessor';

const AdminDashboardIC = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pendentes');
  const [activeTabAdmin, setActiveTabAdmin] = useState('painel');
  const [projetosPendentes, setProjetosPendentes] = useState([]);
  const [projetosAtivos, setProjetosAtivos] = useState([]);
  // Período de inscrição
  const [inscricaoPeriodo, setInscricaoPeriodo] = useState({ data_limite: '', aberto: true });
  const [novaDataLimite, setNovaDataLimite] = useState('');

  // Mock para textos e imagens (você pode integrar com backend depois)
  const [homeTexts, setHomeTexts] = useState({
    titulo: '',
    subtitulo: '',
    texto_pict: ''
  });
  const [edicoesTexts, setEdicoesTexts] = useState({
    titulo: 'Conheça Projetos de Edições Anteriores',
    subtitulo: 'Veja exemplos de projetos já realizados e acesse os editais das últimas edições do programa de Iniciação Científica.',
    bannerImg: null,
    bannerImgPreview: null,
    edicoes: [] // Lista de edições anteriores
  });  const [newEdicao, setNewEdicao] = useState({ ano: '' });
  const [newProjeto, setNewProjeto] = useState({ titulo: '', aluno: '', orientador: '', arquivo: '', ano: '' });
  const [showEditarPerfil, setShowEditarPerfil] = useState(false);
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
  const fetchHomeTexts = async () => {
    try {
      const response = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/home-texts');
      if (response.ok) {
        const data = await response.json();
        setHomeTexts({
          titulo: data.titulo || '',
          subtitulo: data.subtitulo || '',
          texto_pict: data.texto_pict !== undefined && data.texto_pict !== null ? data.texto_pict : ''
        });
      }
    } catch (error) {
      setHomeTexts({
        titulo: '',
        subtitulo: '',
        texto_pict: ''
      });
    }
  };

  const fetchEdicoesTexts = async () => {
    try {
      const response = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/edicoes-texts');
      if (response.ok) {
        const data = await response.json();
        setEdicoesTexts(data); // Atualizar os textos da página de Edições Anteriores no estado inicial
      }
    } catch (error) {
      console.error('Erro ao carregar textos da página de Edições Anteriores:', error);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
        if (payload.is_new_user && !localStorage.getItem('welcome_modal_dismissed_admin')) {
          setShowWelcomeModal(true);
        }
        localStorage.setItem('token', token);
        carregarDados();
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    } else {
      carregarDados();
    }

    fetchHomeTexts();
    fetchEdicoesTexts();
    setLoading(false);
    // eslint-disable-next-line
  }, []);

  const carregarDados = async () => {
    try {
      // Buscar todos os projetos pendentes
      const pendentesRes = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/todos-pendentes');
      if (pendentesRes.ok) {
        const pendentes = await pendentesRes.json();
        setProjetosPendentes(pendentes);
      }
      // Buscar todos os projetos ativos
      const ativosRes = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/todos-ativos');
      if (ativosRes.ok) {
        const ativos = await ativosRes.json();
        setProjetosAtivos(ativos);
      }
      carregarPeriodoInscricao();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const carregarPeriodoInscricao = async () => {
    try {
      const res = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/inscricao-periodo');
      if (res.ok) {
        setInscricaoPeriodo(await res.json());
      }
    } catch (e) {}
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('welcome_modal_dismissed_admin');
    window.location.href = '/login';
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('welcome_modal_dismissed_admin', 'true');
  };

  const handleSalvarDataLimite = async () => {
    if (!novaDataLimite) {
      alert('Selecione uma data limite!');
      return;
    }
    const res = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/inscricao-periodo', {
      method: 'POST',
      body: JSON.stringify({ data_limite: novaDataLimite, aberto: true })
    });
    if (res.ok) {
      alert('Data limite definida!');
      setNovaDataLimite('');
      carregarPeriodoInscricao();
    }
  };

  const handleFecharInscricao = async () => {
    await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/fechar-inscricao', { method: 'POST' });
    carregarPeriodoInscricao();
  };

  const handleAbrirInscricao = async () => {
    try {
      const response = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/abrir-inscricao', { method: 'POST' });
      if (response.ok) {
        alert('Inscrições reabertas com sucesso!');
        carregarPeriodoInscricao();
      }
    } catch (error) {      alert('Erro ao reabrir inscrições.');    }
  };

  // Handlers for Home texts/images
  const handleHomeTextChange = (e) => {
    setHomeTexts((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const handleSaveHome = async () => {
    try {
      const response = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/home-texts', {
        method: 'POST',
        body: JSON.stringify({
          titulo: homeTexts.titulo,
          subtitulo: homeTexts.subtitulo,
          texto_pict: homeTexts.texto_pict
        })
      });
      if (response.ok) {
        alert('Textos da Home atualizados com sucesso!');
        // Dispara evento para outras abas atualizarem a Home
        localStorage.setItem('homeTextsUpdated', Date.now().toString());
        // Atualiza o estado local do admin
        const updatedHomeTexts = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/home-texts');
        if (updatedHomeTexts.ok) {
          const data = await updatedHomeTexts.json();
          setHomeTexts({
            titulo: data.titulo || '',
            subtitulo: data.subtitulo || '',
            texto_pict: data.texto_pict !== undefined && data.texto_pict !== null ? data.texto_pict : ''
          });
        }
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro ao salvar textos da Home:', error);
      alert('Erro ao salvar textos da Home. Tente novamente.');    }
  };

  // Handlers for Edicoes texts/images
  const handleSaveEdicoes = async () => {
    try {
      const response = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/edicoes-texts', {
        method: 'POST',
        body: JSON.stringify({
          titulo: edicoesTexts.titulo,
          subtitulo: edicoesTexts.subtitulo,
          edicoes: edicoesTexts.edicoes // Enviar todas as edições e projetos
        })
      });      if (response.ok) {
        alert('Alterações na página de Edições Anteriores salvas com sucesso!');
        const updatedEdicoesTexts = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/edicoes-texts');
        if (updatedEdicoesTexts.ok) {
          setEdicoesTexts(await updatedEdicoesTexts.json()); // Atualizar o estado local após salvar
        }
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro ao salvar alterações na página de Edições Anteriores:', error);
      alert('Erro ao salvar alterações. Tente novamente.');
    }
  };

  const handleAddEdicao = async () => {
    if (!newEdicao.ano) {
      alert('Preencha o campo de ano para adicionar uma nova edição.');
      return;
    }
    const response = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/edicoes-anteriores', {
      method: 'POST',
      body: JSON.stringify({ ano: newEdicao.ano })
    });    if (response.ok) {
      alert('Nova edição adicionada com sucesso!');
      setNewEdicao({ ano: '' });
      // Atualiza o estado local com as edições atualizadas
      const updatedEdicoesTexts = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/edicoes-texts');
      if (updatedEdicoesTexts.ok) {
        setEdicoesTexts(await updatedEdicoesTexts.json());
      }
    } else {
      const error = await response.json();
      alert(`Erro: ${error.detail}`);
    }
  };

  const handleAddProjeto = async () => {
    if (!newProjeto.titulo || !newProjeto.aluno || !newProjeto.orientador || !newProjeto.ano) {
      alert('Preencha todos os campos para adicionar um novo projeto.');
      return;
    }
    const formData = new FormData();
    formData.append('ano', newProjeto.ano);
    formData.append('titulo', newProjeto.titulo);
    formData.append('aluno', newProjeto.aluno);
    formData.append('orientador', newProjeto.orientador);
    if (newProjeto.arquivo) {
      formData.append('arquivo', newProjeto.arquivo);
    }
    // Não envie Content-Type, o browser define automaticamente para multipart/form-data
    const token = localStorage.getItem('token');
    const response = await fetch('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/edicoes-anteriores/projetos', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });    if (response.ok) {
      alert('Novo projeto adicionado com sucesso!');
      setNewProjeto({ titulo: '', aluno: '', orientador: '', arquivo: '', ano: '' });
      // Atualiza o estado local com as edições atualizadas
      const updatedEdicoesTexts = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/edicoes-texts');
      if (updatedEdicoesTexts.ok) {
        setEdicoesTexts(await updatedEdicoesTexts.json());
      }
    } else {
      const error = await response.json();
      alert(`Erro: ${error.detail}`);
    }
  };

  const handleRemoveEdicao = async (ano) => {
    if (!window.confirm(`Tem certeza que deseja remover a edição ${ano}?`)) return;
    try {
      const response = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/edicoes-anteriores/remover', {
        method: 'POST',
        body: JSON.stringify({ ano })      });
      if (response.ok) {
        const updatedEdicoesTexts = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/edicoes-texts');
        if (updatedEdicoesTexts.ok) {
          setEdicoesTexts(await updatedEdicoesTexts.json());
        }
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      alert('Erro ao remover edição.');
    }
  };

  const handleRemoveProjeto = async (ano, idx) => {
    if (!window.confirm('Tem certeza que deseja remover este projeto?')) return;
    try {
      const response = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/edicoes-anteriores/remover-projeto', {
        method: 'POST',
        body: JSON.stringify({ ano, idx })      });
      if (response.ok) {
        const updatedEdicoesTexts = await fetchAuth('https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/projetos/edicoes-texts');
        if (updatedEdicoesTexts.ok) {
          setEdicoesTexts(await updatedEdicoesTexts.json());
        }
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      alert('Erro ao remover projeto.');
    }  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Portal IC - Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="h-5 w-5" />
                {projetosPendentes.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {projetosPendentes.length}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">Administrador</p>
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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Portal de Iniciação Científica - Admin
              </h2>
              <p className="text-blue-100">
                Visualize e gerencie todos os projetos de iniciação científica do sistema.
              </p>
            </div>
            <GraduationCap className="h-16 w-16 text-blue-200" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{projetosPendentes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{projetosAtivos.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Projetos</p>
                <p className="text-2xl font-bold text-gray-900">{projetosPendentes.length + projetosAtivos.length}</p>
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
                  onClick={() => setShowEditarPerfil(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('pendentes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pendentes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Todos Pendentes ({projetosPendentes.length})
              </button>
              <button
                onClick={() => setActiveTab('ativos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ativos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Todos Ativos ({projetosAtivos.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'pendentes' && (
              <div className="space-y-4">
                {projetosPendentes.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto pendente</h3>
                    <p className="text-gray-600 mb-4">Quando alunos submeterem projetos, eles aparecerão aqui para aprovação.</p>
                  </div>
                ) : (
                  projetosPendentes.map((projeto) => (
                    <div key={projeto.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{projeto.titulo}</h3>
                          <p className="text-sm text-gray-600">
                            <strong>Aluno:</strong> {projeto.aluno_nome} (Matrícula: {projeto.matricula})
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Orientador:</strong> {projeto.orientador_nome}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Submetido em:</strong> {new Date(projeto.data_submissao).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Pendente
                        </span>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {projeto.descricao}
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'ativos' && (
              <div className="space-y-4">
                {projetosAtivos.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto ativo</h3>
                    <p className="text-gray-600">Projetos aprovados aparecerão aqui para acompanhamento.</p>
                  </div>
                ) : (
                  projetosAtivos.map((projeto) => (
                    <div key={projeto.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{projeto.titulo}</h3>
                          <p className="text-sm text-gray-600">
                            <strong>Aluno:</strong> {projeto.aluno_nome} (Matrícula: {projeto.matricula})
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Orientador:</strong> {projeto.orientador_nome}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Aprovado em:</strong> {new Date(projeto.data_aprovacao).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Ativo
                        </span>
                      </div>
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
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => window.location.href = `/projeto/${projeto.id}/documentos`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Acompanhar Projeto
                        </button>
                        <button 
                          onClick={() => window.location.href = `/projeto/${projeto.id}/documentos`}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Ver Documentos
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Seção de Período de Inscrição */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Período de Inscrição de Projetos</h2>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data limite para inscrição:</label>
              <input
                type="datetime-local"
                value={novaDataLimite}
                onChange={e => setNovaDataLimite(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSalvarDataLimite}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Definir Data Limite
            </button>
            <button
              onClick={handleFecharInscricao}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              disabled={!inscricaoPeriodo.aberto}
            >
              Fechar Inscrições
            </button>
            <button
              onClick={handleAbrirInscricao}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              disabled={inscricaoPeriodo.aberto}
            >
              Abrir Inscrições
            </button>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-700">
              Status atual:{" "}
              <span className={inscricaoPeriodo.aberto ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
                {inscricaoPeriodo.aberto ? "Inscrições abertas" : "Inscrições fechadas"}
              </span>
              {inscricaoPeriodo.data_limite && (
                <>
                  {" | Data limite: "}
                  <span className="font-mono">{new Date(inscricaoPeriodo.data_limite).toLocaleString()}</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Abas de Administração */}
        <div className="mb-8">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTabAdmin('painel')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTabAdmin === 'painel' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-600'}`}
            >
              Painel
            </button>
            <button
              onClick={() => setActiveTabAdmin('editar-home')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTabAdmin === 'editar-home' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-600'}`}
            >
              Editar Home
            </button>
            <button
              onClick={() => setActiveTabAdmin('editar-edicoes')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTabAdmin === 'editar-edicoes' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-600'}`}
            >
              Editar Edições Anteriores
            </button>
          </nav>
        </div>

        {/* Conteúdo das Abas */}
        {activeTabAdmin === 'painel' && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Painel Principal</h3>
            <p className="text-gray-600">Conteúdo do painel já exibido acima.</p>
          </div>
        )}

        {activeTabAdmin === 'editar-home' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Edit className="h-5 w-5 mr-2" /> Editar Textos da Home
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
              <input
                type="text"
                name="titulo"
                value={homeTexts.titulo}
                onChange={handleHomeTextChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
              <textarea
                name="subtitulo"
                value={homeTexts.subtitulo}
                onChange={handleHomeTextChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Destaque PICT (editável)</label>
              <textarea
                name="texto_pict"
                value={homeTexts.texto_pict}
                onChange={handleHomeTextChange}
                className="w-full border border-blue-300 rounded-lg px-3 py-2"
                rows={12}
                placeholder="Texto de destaque do PICT, editável pelo admin. Use Markdown ou HTML para formatação."
              />
            </div>
            <button
              onClick={handleSaveHome}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        )}

        {activeTabAdmin === 'editar-edicoes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Edit className="h-5 w-5 mr-2" /> Editar Edições Anteriores
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título da Seção</label>
              <input
                type="text"
                name="titulo"
                value={edicoesTexts.titulo}
                onChange={(e) => setEdicoesTexts({ ...edicoesTexts, titulo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
              <textarea
                name="subtitulo"
                value={edicoesTexts.subtitulo}
                onChange={(e) => setEdicoesTexts({ ...edicoesTexts, subtitulo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-900 mb-2">Adicionar Nova Edição</h3>
              <input
                type="number"
                placeholder="Ano"
                value={newEdicao.ano}
                onChange={(e) => setNewEdicao({ ...newEdicao, ano: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
              />
              <button
                onClick={handleAddEdicao}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-2"
              >
                Adicionar Edição
              </button>
            </div>
            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-900 mb-2">Adicionar Novo Projeto</h3>
              <input
                type="text"
                placeholder="Título do Projeto"
                value={newProjeto.titulo}
                onChange={(e) => setNewProjeto({ ...newProjeto, titulo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
              />
              <input
                type="text"
                placeholder="Nome do Aluno"
                value={newProjeto.aluno}
                onChange={(e) => setNewProjeto({ ...newProjeto, aluno: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
              />
              <input
                type="text"
                placeholder="Nome do Orientador"
                value={newProjeto.orientador}
                onChange={(e) => setNewProjeto({ ...newProjeto, orientador: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
              />
              <input
                type="number"
                placeholder="Ano da Edição"
                value={newProjeto.ano}
                onChange={(e) => setNewProjeto({ ...newProjeto, ano: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
              />
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setNewProjeto({ ...newProjeto, arquivo: e.target.files[0] })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <button
                onClick={handleAddProjeto}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-2"
              >
                Adicionar Projeto
              </button>
            </div>
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-900 mb-2">Edições Existentes</h3>
              {edicoesTexts.edicoes && edicoesTexts.edicoes.length > 0 ? (
                edicoesTexts.edicoes.map((edicao) => (
                  <div key={edicao.ano} className="mb-6 border-b pb-4">
                    <div className="flex items-center mb-2">
                      <span className="font-bold text-blue-700 mr-2">Ano: {edicao.ano}</span>
                      <button
                        onClick={() => handleRemoveEdicao(edicao.ano)}
                        className="ml-2 text-red-600 hover:underline text-sm"
                      >
                        Remover Edição
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {edicao.projetos && edicao.projetos.length > 0 ? (
                        edicao.projetos.map((proj, idx) => (
                          <div key={idx} className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col">
                            <span className="font-semibold">{proj.titulo}</span>
                            <span className="text-sm text-gray-700">Aluno: {proj.aluno}</span>
                            <span className="text-sm text-gray-700 mb-2">Orientador: {proj.orientador}</span>
                            <button
                              onClick={() => handleRemoveProjeto(edicao.ano, idx)}
                              className="text-red-600 hover:underline text-xs self-end"
                            >
                              Remover Projeto
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 col-span-2">Nenhum projeto nesta edição.</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-gray-500">Nenhuma edição cadastrada.</span>
              )}
            </div>
            <button
              onClick={handleSaveEdicoes}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        )}
      </div>

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <GraduationCap className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bem-vindo ao Portal IC!</h3>
              <p className="text-gray-600 mb-4">
                Portal de Iniciação Científica - admin pode visualizar todos os projetos do sistema.
              </p>
              <div className="text-left bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Como administrador você pode:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Visualizar todos os projetos pendentes e ativos</li>
                  <li>✅ Acompanhar o desenvolvimento de todos os trabalhos</li>
                  <li>✅ Acessar documentos e detalhes de qualquer projeto</li>
                </ul>
              </div>
              <button 
                onClick={handleCloseWelcomeModal}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Começar a usar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Perfil Admin (usar EditarPerfilProfessor) */}
      {showEditarPerfil && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">            <EditarPerfilProfessor
              isAdmin
              onClose={() => setShowEditarPerfil(false)}
              afterSave={() => setShowEditarPerfil(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardIC;
