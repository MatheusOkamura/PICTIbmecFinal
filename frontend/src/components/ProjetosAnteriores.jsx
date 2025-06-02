import React, { useEffect, useState } from 'react';
import { GraduationCap, BookOpen, Calendar, FileText, Download, ArrowLeft } from 'lucide-react';

const edicoesMock = [
  {
    ano: 2023,
    edital: '/editais/edital-ic-2023.pdf',
    projetos: [
      { titulo: 'Análise de Dados em Saúde', aluno: 'Maria Silva', orientador: 'Prof. João Souza', arquivo: '/projetos/2023/analise-dados-saude.pdf' },
      { titulo: 'Robótica Educacional', aluno: 'Lucas Lima', orientador: 'Profª Ana Paula', arquivo: '/projetos/2023/robotica-educacional.pdf' }
    ]
  },
  {
    ano: 2022,
    edital: '/editais/edital-ic-2022.pdf',
    projetos: [
      { titulo: 'Sustentabilidade Urbana', aluno: 'Fernanda Costa', orientador: 'Prof. Carlos Mendes', arquivo: '/projetos/2022/sustentabilidade-urbana.pdf' }
    ]
  }
];

const ProjetosAnteriores = () => {
  const [edicoes, setEdicoes] = useState([]);

  useEffect(() => {
    // Aqui você pode buscar do backend futuramente
    setEdicoes(edicoesMock);
  }, []);

  const voltar = () => window.history.back();

  return (
    <div className="min-h-screen bg-white">
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
            <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Edições Anteriores & Editais</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Conheça Projetos de Edições Anteriores
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Veja exemplos de projetos já realizados e acesse os editais das últimas edições do programa de Iniciação Científica.
          </p>
        </div>
      </section>

      {/* Lista de Edições */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          {edicoes.map((edicao) => (
            <div key={edicao.ano} className="mb-12">
              <div className="flex items-center mb-4">
                <Calendar className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-2xl font-bold text-gray-900 mr-4">Edição {edicao.ano}</h3>
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {edicao.projetos.map((proj, idx) => (
                  <div key={idx} className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col">
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">{proj.titulo}</h4>
                    <p className="text-gray-700 mb-1"><strong>Aluno:</strong> {proj.aluno}</p>
                    <p className="text-gray-700 mb-3"><strong>Orientador:</strong> {proj.orientador}</p>
                    <a
                      href={proj.arquivo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center text-blue-700 hover:underline"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar Projeto
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA para Home */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600">
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
