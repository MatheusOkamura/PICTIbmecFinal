import React, { useState, useEffect } from 'react';
import { GraduationCap, Calendar, FileText, Download } from 'lucide-react';

const ProjetosAnteriores = () => {
  const [edicoesTexts, setEdicoesTexts] = useState({
    titulo: 'Conheça Projetos de Edições Anteriores',
    subtitulo: 'Veja exemplos de projetos já realizados e acesse os editais das últimas edições do programa de Iniciação Científica.',
    edicoes: []
  });

  useEffect(() => {
    const fetchEdicoesTexts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/projetos/edicoes-texts', {
          headers: {
            'Accept': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setEdicoesTexts({
            titulo: data.titulo,
            subtitulo: data.subtitulo,
            edicoes: Array.isArray(data.edicoes) ? data.edicoes : []
          });
        } else {
          setEdicoesTexts(prev => ({
            ...prev,
            subtitulo: 'Erro ao buscar edições anteriores. Tente novamente mais tarde.',
            edicoes: []
          }));
        }
      } catch (error) {
        setEdicoesTexts(prev => ({
          ...prev,
          subtitulo: 'Erro ao conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.',
          edicoes: []
        }));
      }    };
    fetchEdicoesTexts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header bonito igual ao da Home */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Portal de Iniciação Científica IBMEC</h1>
            </div>
            <a
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>Voltar para Home</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Section - Título e Subtítulo */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {edicoesTexts.titulo}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {edicoesTexts.subtitulo}
            </p>
          </div>
        </div>
      </section>

      {/* Edições e Projetos com novo CSS */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          {edicoesTexts.edicoes && edicoesTexts.edicoes.length > 0 ? (
            edicoesTexts.edicoes.map((edicao) => (
              <div key={edicao.ano} className="mb-12">
                <div className="flex items-center mb-4">
                  <Calendar className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-2xl font-bold text-gray-900 mr-4">Edição {edicao.ano}</h3>
                  {edicao.edital && (
                    <a
                      href={edicao.edital}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline ml-2"
                    >
                      <FileText className="h-5 w-5 mr-1" />
                      Edital {edicao.ano}
                      <Download className="h-4 w-4 ml-1" />
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {edicao.projetos && edicao.projetos.length > 0 ? (
                    edicao.projetos.map((proj, idx) => (
                      <div key={idx} className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col">
                        <h4 className="text-lg font-semibold text-blue-900 mb-2">{proj.titulo}</h4>
                        <p className="text-gray-700 mb-1"><strong>Aluno:</strong> {proj.aluno}</p>
                        <p className="text-gray-700 mb-3"><strong>Orientador:</strong> {proj.orientador}</p>
                        {proj.arquivo && (
                          <a
                            href={proj.arquivo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto inline-flex items-center text-blue-700 hover:underline"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Baixar Projeto
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 col-span-2">Nenhum projeto disponível para esta edição.</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">Nenhuma edição disponível no momento.</p>
          )}
        </div>
      </section>

      {/* CTA para Home */}
      <section className="py-12" style={{ background: 'linear-gradient(to right, #7c3aed, #6366f1)' }}>
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold text-white mb-4">
            Quer participar da próxima edição?
          </h2>
          <p className="text-lg text-blue-100 mb-6">
            Consulte o edital vigente e inscreva seu projeto!
          </p>
          <a
            href="/"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg flex items-center justify-center mx-auto w-fit"
          >
            Voltar para Home
          </a>
        </div>
      </section>
    </div>
  );
};

export default ProjetosAnteriores;
