import React, { useState, useEffect, useCallback } from 'react';
import { User, GraduationCap, Save, ArrowLeft, Plus, X } from 'lucide-react';

const EditarPerfilAluno = () => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState({
    nome: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    curso: '',
    semestre: 1,
    periodo: 'matutino',
    biografia: '',
    interesses_pesquisa: [],
    linkedin_url: '',
    github_url: ''
  });
  const [novoInteresse, setNovoInteresse] = useState('');
  const [salvando, setSalvando] = useState(false);

  const cursos = [
    'Administração',
    'Arquitetura',
    'Ciência de Dados e IA',
    'Ciências Econômicas',
    'Engenharia de Produção',
    'Engenharia de Computação',
    'Engenharia de Software',
    'Direito'
  ];

  // Função para fazer requisições autenticadas
  const fetchAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }    });
  };

  const carregarPerfil = useCallback(async () => {
    try {
      const response = await fetchAuth('http://localhost:8000/api/v1/perfis/meu-perfil');
      if (response.ok) {
        const perfilData = await response.json();
        setPerfil({
          nome: perfilData.nome || '',
          email: perfilData.email || '',
          telefone: perfilData.telefone || '',
          data_nascimento: perfilData.data_nascimento || '',
          curso: perfilData.curso || '',
          periodo: perfilData.periodo || '',
          interesses_pesquisa: perfilData.interesses_pesquisa || [],
          linkedin_url: perfilData.linkedin_url || '',
          github_url: perfilData.github_url || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  }, []);
  useEffect(() => {
    // Obter dados do usuário do token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
        
        // Carregar perfil da API
        carregarPerfil();
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    }  }, [carregarPerfil]);

  const adicionarInteresse = () => {
    if (novoInteresse.trim() && !perfil.interesses_pesquisa.includes(novoInteresse.trim())) {
      setPerfil(prev => ({
        ...prev,
        interesses_pesquisa: [...prev.interesses_pesquisa, novoInteresse.trim()]
      }));
      setNovoInteresse('');
    }
  };

  const removerInteresse = (interesse) => {
    setPerfil(prev => ({
      ...prev,
      interesses_pesquisa: prev.interesses_pesquisa.filter(i => i !== interesse)
    }));
  };

  const handleSalvar = async () => {
    setSalvando(true);
    
    try {
      const response = await fetchAuth('http://localhost:8000/api/v1/perfis/atualizar-aluno', {
        method: 'PUT',
        body: JSON.stringify(perfil)
      });

      if (response.ok) {
        alert('Perfil atualizado com sucesso!');
        window.history.back();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const voltar = () => {
    window.history.back();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600">Faça login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={voltar}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Voltar
            </button>
            <GraduationCap className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Editar Perfil - Aluno</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Header do Card */}
          <div className="flex items-center mb-6">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Informações do Perfil</h2>
              <p className="text-gray-600">Atualize suas informações acadêmicas e interesses</p>
            </div>
          </div>

          {/* Formulário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome Completo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={perfil.nome}
                onChange={(e) => setPerfil(prev => ({ ...prev, nome: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Seu nome completo"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Institucional
              </label>
              <input
                type="email"
                value={perfil.email}
                disabled
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
                placeholder="Email não pode ser alterado"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={perfil.telefone}
                onChange={(e) => setPerfil(prev => ({ ...prev, telefone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="(21) 99999-9999"
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={perfil.data_nascimento}
                onChange={(e) => setPerfil(prev => ({ ...prev, data_nascimento: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Curso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curso
              </label>
              <select
                value={perfil.curso}
                onChange={(e) => setPerfil(prev => ({ ...prev, curso: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Selecione seu curso</option>
                {cursos.map((curso) => (
                  <option key={curso} value={curso}>{curso}</option>
                ))}
              </select>
            </div>

            {/* Semestre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semestre Atual
              </label>
              <select
                value={perfil.semestre}
                onChange={(e) => setPerfil(prev => ({ ...prev, semestre: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {[1,2,3,4,5,6,7,8,9,10].map((sem) => (
                  <option key={sem} value={sem}>{sem}º Semestre</option>
                ))}
              </select>
            </div>

            {/* Período */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={perfil.periodo}
                onChange={(e) => setPerfil(prev => ({ ...prev, periodo: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="matutino">Matutino</option>
                <option value="vespertino">Vespertino</option>
                <option value="noturno">Noturno</option>
              </select>
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn (URL)
              </label>
              <input
                type="url"
                value={perfil.linkedin_url}
                onChange={(e) => setPerfil(prev => ({ ...prev, linkedin_url: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://linkedin.com/in/seu-perfil"
              />
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub (URL)
              </label>
              <input
                type="url"
                value={perfil.github_url}
                onChange={(e) => setPerfil(prev => ({ ...prev, github_url: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://github.com/seu-usuario"
              />
            </div>

            {/* Biografia */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sobre você
              </label>
              <textarea
                rows={4}
                value={perfil.biografia}
                onChange={(e) => setPerfil(prev => ({ ...prev, biografia: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Conte um pouco sobre você, seus objetivos acadêmicos e profissionais..."
              />
            </div>

            {/* Interesses de Pesquisa */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interesses de Pesquisa
              </label>
              
              {/* Adicionar novo interesse */}
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={novoInteresse}
                  onChange={(e) => setNovoInteresse(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && adicionarInteresse()}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Digite um interesse de pesquisa (ex: Sustentabilidade)"
                />
                <button
                  onClick={adicionarInteresse}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Lista de interesses */}
              <div className="flex flex-wrap gap-2">
                {perfil.interesses_pesquisa.map((interesse, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{interesse}</span>
                    <button
                      onClick={() => removerInteresse(interesse)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              {perfil.interesses_pesquisa.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">
                  Adicione seus interesses de pesquisa para encontrar orientadores compatíveis.
                </p>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={voltar}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {salvando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card de Dicas */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">💡 Dicas para um perfil atrativo</h3>
          <ul className="space-y-2 text-green-800 text-sm">
            <li>• Complete todas as informações para aumentar suas chances de seleção</li>
            <li>• Seus interesses de pesquisa ajudam a conectar com orientadores certos</li>
            <li>• Uma biografia bem escrita mostra seu comprometimento acadêmico</li>
            <li>• Links para LinkedIn e GitHub demonstram seu engajamento profissional</li>
          </ul>
        </div>

        {/* Card de Status Acadêmico */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📊 Status Acadêmico</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Matrícula:</span>
              <p className="text-blue-800">{user.matricula || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Semestre:</span>
              <p className="text-blue-800">{perfil.semestre}º</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Curso:</span>
              <p className="text-blue-800">{perfil.curso || 'Não informado'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfilAluno;