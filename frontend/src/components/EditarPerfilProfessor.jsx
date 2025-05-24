import React, { useState, useEffect } from 'react';
import { User, GraduationCap, Save, ArrowLeft, Plus, X } from 'lucide-react';

const EditarPerfilProfessor = () => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState({
    nome: '',
    email: '',
    telefone: '',
    titulacao: '',
    lattes_url: '',
    biografia: '',
    areas_interesse: []
  });
  const [novaArea, setNovaArea] = useState('');
  const [salvando, setSalvando] = useState(false);

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
    }
  }, []);

  const carregarPerfil = async () => {
    try {
      const response = await fetchAuth('http://localhost:8000/api/v1/perfis/meu-perfil');
      if (response.ok) {
        const perfilData = await response.json();
        setPerfil({
          nome: perfilData.nome || '',
          email: perfilData.email || '',
          telefone: perfilData.telefone || '',
          titulacao: perfilData.titulacao || '',
          lattes_url: perfilData.lattes_url || '',
          biografia: perfilData.biografia || '',
          areas_interesse: perfilData.areas_interesse || []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const adicionarArea = () => {
    if (novaArea.trim() && !perfil.areas_interesse.includes(novaArea.trim())) {
      setPerfil(prev => ({
        ...prev,
        areas_interesse: [...prev.areas_interesse, novaArea.trim()]
      }));
      setNovaArea('');
    }
  };

  const removerArea = (area) => {
    setPerfil(prev => ({
      ...prev,
      areas_interesse: prev.areas_interesse.filter(a => a !== area)
    }));
  };

  const handleSalvar = async () => {
    setSalvando(true);
    
    try {
      const response = await fetchAuth('http://localhost:8000/api/v1/perfis/atualizar-professor', {
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
            <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Editar Perfil - Professor</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Header do Card */}
          <div className="flex items-center mb-6">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Informações do Perfil</h2>
              <p className="text-gray-600">Atualize suas informações e áreas de interesse</p>
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(21) 99999-9999"
              />
            </div>

            {/* Titulação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titulação
              </label>
              <select
                value={perfil.titulacao}
                onChange={(e) => setPerfil(prev => ({ ...prev, titulacao: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione sua titulação</option>
                <option value="Graduado">Graduado</option>
                <option value="Especialista">Especialista</option>
                <option value="Mestre">Mestre</option>
                <option value="Doutor">Doutor</option>
                <option value="Pós-doutor">Pós-doutor</option>
              </select>
            </div>

            {/* Currículo Lattes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currículo Lattes (URL)
              </label>
              <input
                type="url"
                value={perfil.lattes_url}
                onChange={(e) => setPerfil(prev => ({ ...prev, lattes_url: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="http://lattes.cnpq.br/..."
              />
            </div>

            {/* Biografia */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografia / Apresentação
              </label>
              <textarea
                rows={4}
                value={perfil.biografia}
                onChange={(e) => setPerfil(prev => ({ ...prev, biografia: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Conte um pouco sobre sua trajetória acadêmica e profissional..."
              />
            </div>

            {/* Áreas de Interesse */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Áreas de Interesse / Pesquisa
              </label>
              
              {/* Adicionar nova área */}
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={novaArea}
                  onChange={(e) => setNovaArea(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && adicionarArea()}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite uma área de interesse (ex: Inteligência Artificial)"
                />
                <button
                  onClick={adicionarArea}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Lista de áreas */}
              <div className="flex flex-wrap gap-2">
                {perfil.areas_interesse.map((area, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{area}</span>
                    <button
                      onClick={() => removerArea(area)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              {perfil.areas_interesse.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">
                  Adicione suas áreas de interesse para que os alunos possam encontrá-lo mais facilmente.
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
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
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Dicas para um perfil completo</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• Mantenha suas áreas de interesse atualizadas para atrair projetos relevantes</li>
            <li>• Uma biografia detalhada ajuda os alunos a conhecer melhor seu perfil</li>
            <li>• O link do Currículo Lattes aumenta sua credibilidade acadêmica</li>
            <li>• Informações de contato atualizadas facilitam a comunicação</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfilProfessor;