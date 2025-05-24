import React, { useState, useEffect } from 'react';
import { Upload, FileText, MessageSquare, Calendar, User, ArrowLeft, Send, Download } from 'lucide-react';

const DocumentosProjeto = () => {
  const [user, setUser] = useState(null);
  const [projeto, setProjeto] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [novoComentario, setNovoComentario] = useState('');
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);
  const [uploadData, setUploadData] = useState({
    arquivo: null,
    comentario: ''
  });

  const projetoId = window.location.pathname.split('/')[2]; // Extrair ID da URL

  // Função para fazer requisições autenticadas
  const fetchAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
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
        
        // Carregar dados do projeto e documentos
        carregarDados();
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    }
    setLoading(false);
  }, []);

  const carregarDados = async () => {
    try {
      // Carregar documentos do projeto
      const response = await fetchAuth(`http://localhost:8000/api/v1/documentos/projeto/${projetoId}`);
      if (response.ok) {
        const docs = await response.json();
        setDocumentos(docs);
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  const handleUpload = async () => {
    if (!uploadData.arquivo) {
      alert('Selecione um arquivo para upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadData.arquivo);
    formData.append('comentario', uploadData.comentario);

    try {
      const response = await fetchAuth(`http://localhost:8000/api/v1/documentos/upload/${projetoId}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Documento enviado com sucesso!');
        setShowUploadModal(false);
        setUploadData({ arquivo: null, comentario: '' });
        carregarDados(); // Recarregar documentos
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao enviar documento. Tente novamente.');
    }
  };

  const handleComentario = async (documentoId) => {
    if (!novoComentario.trim()) {
      alert('Digite um comentário');
      return;
    }

    try {
      const response = await fetchAuth(`http://localhost:8000/api/v1/documentos/comentar/${documentoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comentario: novoComentario })
      });

      if (response.ok) {
        setNovoComentario('');
        setDocumentoSelecionado(null);
        carregarDados(); // Recarregar documentos
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro ao comentar:', error);
      alert('Erro ao enviar comentário. Tente novamente.');
    }
  };

  const voltar = () => {
    window.history.back();
  };

  const formatarTamanhoArquivo = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
          <p className="text-gray-600">Faça login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={voltar}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Voltar
            </button>
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Documentos do Projeto</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header do Projeto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Projeto #{projetoId}</h2>
              <p className="text-gray-600">Gerencie documentos e acompanhe comentários</p>
            </div>
            {user.user_type === 'aluno' && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Upload className="h-5 w-5" />
                <span>Novo Upload</span>
              </button>
            )}
          </div>
        </div>

        {/* Lista de Documentos */}
        <div className="space-y-6">
          {documentos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento enviado</h3>
              <p className="text-gray-600 mb-4">
                {user.user_type === 'aluno' 
                  ? 'Faça o upload do primeiro documento do seu projeto'
                  : 'Aguarde o aluno enviar documentos para acompanhar'
                }
              </p>
              {user.user_type === 'aluno' && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enviar Documento
                </button>
              )}
            </div>
          ) : (
            documentos.map((documento) => (
              <div key={documento.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Header do Documento */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{documento.nome_arquivo}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{formatarTamanhoArquivo(documento.tamanho_arquivo)}</span>
                        <span>{documento.tipo_arquivo}</span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(documento.data_upload).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Baixar</span>
                  </button>
                </div>

                {/* Comentário do Aluno */}
                {documento.comentario_aluno && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Comentário do Aluno:</span>
                    </div>
                    <p className="text-blue-800 text-sm">{documento.comentario_aluno}</p>
                  </div>
                )}

                {/* Comentários */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comentários ({documento.comentarios?.length || 0})
                  </h4>

                  {/* Lista de Comentários */}
                  <div className="space-y-3 mb-4">
                    {documento.comentarios?.map((comentario, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className={`p-2 rounded-full ${
                          comentario.usuario_tipo === 'aluno' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <User className={`h-4 w-4 ${
                            comentario.usuario_tipo === 'aluno' ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {comentario.usuario_nome}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              comentario.usuario_tipo === 'aluno' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {comentario.usuario_tipo === 'aluno' ? 'Aluno' : 'Professor'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comentario.data_comentario).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comentario.comentario}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Adicionar Comentário */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex space-x-3">
                      <div className={`p-2 rounded-full ${
                        user.user_type === 'aluno' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <User className={`h-4 w-4 ${
                          user.user_type === 'aluno' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <textarea
                          rows={3}
                          value={documentoSelecionado === documento.id ? novoComentario : ''}
                          onChange={(e) => {
                            setDocumentoSelecionado(documento.id);
                            setNovoComentario(e.target.value);
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Adicione um comentário..."
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => handleComentario(documento.id)}
                            disabled={documentoSelecionado !== documento.id || !novoComentario.trim()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="h-4 w-4" />
                            <span>Comentar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Enviar Documento</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arquivo
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadData(prev => ({ ...prev, arquivo: e.target.files[0] }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: PDF, DOC, DOCX, PPT, PPTX, TXT
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentário (opcional)
                </label>
                <textarea
                  rows={4}
                  value={uploadData.comentario}
                  onChange={(e) => setUploadData(prev => ({ ...prev, comentario: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva o documento ou adicione observações..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleUpload}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Enviar</span>
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentosProjeto;