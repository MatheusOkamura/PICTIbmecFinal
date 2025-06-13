import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, BookOpen, Award, CheckCircle, ArrowRight, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [homeTexts, setHomeTexts] = useState({
    titulo: 'Portal de Iniciação Científica',
    subtitulo: 'Conecte-se com orientadores, desenvolva projetos inovadores e dê os primeiros passos na sua carreira de pesquisador.'
  });

  // Novos estados para os números dinâmicos
  const [projetosTotal, setProjetosTotal] = useState(0);
  const [orientadoresTotal, setOrientadoresTotal] = useState(0);
  const [alunosTotal, setAlunosTotal] = useState(0);
  const [projetosFinalizados, setProjetosFinalizados] = useState(0);

  const navigate = useNavigate();
  const handleLogin = () => {
    window.location.href = 'http://localhost:8000/api/v1/auth/microsoft-login';
  };

  useEffect(() => {
    const fetchHomeTexts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/projetos/home-texts');
        if (response.ok) {
          const data = await response.json();
          setHomeTexts(data);
        }
      } catch (error) {
        console.error('Erro ao carregar textos da Home:', error);
      }
    };

    // Buscar estatísticas do banco
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/projetos/estatisticas');
        if (response.ok) {
          const stats = await response.json();
          setProjetosTotal(stats.projetos_total || 0);
          setOrientadoresTotal(stats.orientadores_total || 0);
          setAlunosTotal(stats.alunos_total || 0);
          setProjetosFinalizados(stats.projetos_finalizados || 0);
        }
      } catch (error) {
        // Se der erro, mantém os valores padrão
      }
    };

    fetchHomeTexts();
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Portal de Iniciação Científica IBMEC</h1>
            </div>
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Entrar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <GraduationCap className="h-20 w-20 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {homeTexts.titulo}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {homeTexts.subtitulo}
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button
                onClick={handleLogin}
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <LogIn className="h-5 w-5" />
                <span>Acessar Portal</span>
              </button>
              <button
                onClick={() => navigate('/edicoes-anteriores')}
                className="w-full sm:w-auto bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
              >
                <BookOpen className="h-5 w-5" />
                <span>Edições Anteriores & Editais</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Como Funciona o Portal
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Uma plataforma completa para gerenciar todo o ciclo de vida dos projetos de iniciação científica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Para Alunos */}
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Para Alunos</h3>
              <p className="text-gray-600 text-sm">
                Cadastre projetos, escolha orientadores e acompanhe seu desenvolvimento científico.
              </p>
            </div>

            {/* Para Professores */}
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Para Professores</h3>
              <p className="text-gray-600 text-sm">
                Aprove projetos, oriente alunos e acompanhe o progresso dos trabalhos.
              </p>
            </div>

            {/* Gestão de Projetos */}
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestão Completa</h3>
              <p className="text-gray-600 text-sm">
                Sistema completo para upload de documentos, comentários e feedback.
              </p>
            </div>

            {/* Resultados */}
            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Resultados</h3>
              <p className="text-gray-600 text-sm">
                Desenvolva habilidades de pesquisa e construa um portfólio científico.
              </p>
            </div>
          </div>
        </div>
      </section>
     
      {/* Process Section */}
      {/*
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Processo Simplificado
            </h2>
            <p className="text-lg text-gray-600">
              Em poucos passos você estará desenvolvendo seu projeto de iniciação científica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Passo 1 *}
            <div className="text-center">
              <div className="bg-blue-600 text-white p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cadastre seu Projeto</h3>
              <p className="text-gray-600 mb-4">
                Descreva sua ideia de pesquisa e selecione um orientador da lista de professores disponíveis.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>Título e descrição do projeto</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                  <Users className="h-4 w-4" />
                  <span>Escolha do orientador</span>
                </div>
              </div>
            </div>

            {/* Passo 2 *}
            <div className="text-center">
              <div className="bg-green-600 text-white p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aguarde Aprovação</h3>
              <p className="text-gray-600 mb-4">
                O professor orientador avaliará sua proposta e poderá aprovar ou solicitar ajustes.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Avaliação pelo orientador</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>Prazo de resposta: até 7 dias</span>
                </div>
              </div>
            </div>

            {/* Passo 3 *}
            <div className="text-center">
              <div className="bg-purple-600 text-white p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Desenvolva e Publique</h3>
              <p className="text-gray-600 mb-4">
                Com o projeto aprovado, faça uploads de documentos, receba feedback e desenvolva sua pesquisa.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>Upload de relatórios</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                  <Award className="h-4 w-4" />
                  <span>Orientação contínua</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}
      {/* Destaque PICT 2025 */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="max-w-3xl mx-auto px-6 rounded-2xl shadow-lg bg-white/90 border border-blue-100">
          <div className="text-center mb-6">
            <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow">
              Fique por dentro | Inscrições abertas para o PICT 2025 – Ibmec SP
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4 text-center">
            A 6ª edição do Programa de Iniciação Científica e Tecnológica (PICT) já está com inscrições abertas!
          </h2>
          <p className="text-gray-700 text-lg mb-4 text-center">
            Essa é uma oportunidade única para os alunos do Ibmec São Paulo se aprofundarem no universo da pesquisa científica.
          </p>
          <p className="text-gray-700 mb-4 text-center">
            Participar da Iniciação Científica é um diferencial importante para sua carreira. O PICT é uma excelente oportunidade de complementar sua formação acadêmica, proporcionando experiência prática e construção de conhecimento científico.
          </p>
          <p className="text-gray-700 mb-4 text-center">
            Durante o programa, você terá o suporte de um professor pesquisador experiente, que irá orientá-lo no planejamento, na execução e na apresentação do seu estudo científico. Não perca essa chance de enriquecer seu currículo e desenvolver habilidades que farão toda a diferença no mercado de trabalho!
          </p>
          <h3 className="text-lg font-semibold text-blue-800 mb-2 mt-6">Como fazer a inscrição no PICT?</h3>
          <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1 pl-4">
            <li>
              Contatar um professor da área de seu interesse e verificar a disponibilidade para a orientação (<span className="font-medium">Edital &gt; Relação de professores/área</span>);
            </li>
            <li>
              Elaborar uma proposta do projeto para submeter na inscrição;
            </li>
            <li>
              Reunir os documentos necessários para a inscrição;
            </li>
            <li>
              Efetivar a sua inscrição no processo seletivo do PICT conforme orientações do Edital <span className="font-medium">(até 18/11/24)</span>;
            </li>
            <li>
              Preparar a apresentação de seu projeto <span className="font-medium">(fevereiro/2025)</span>.
            </li>
          </ol>
          <p className="text-gray-700 mb-4 text-center">
            <span className="font-semibold">As inscrições do programa vão até o dia <span className="text-blue-700">18/11/24</span>,</span> e para mais detalhes sobre o PICT 2025, consulte o edital disponível através dos links abaixo:
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 mb-2">
            <a
              href="https://drive.google.com/file/d/1hOlRuJ1D_4Wt8qkCSwX9IVQaBj9bHeJg/view"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition-colors text-lg text-center"
            >
              Paulista
            </a>
            <a
              href="https://drive.google.com/file/d/1LeuIZ5r9B4dRPgjKqFK4qk1Q2eWS6NQL/view"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition-colors text-lg text-center"
            >
              Faria Lima
            </a>
          </div>
        </div>
      </section>
      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Por que participar da Iniciação Científica?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Desenvolva Habilidades de Pesquisa</h3>
                    <p className="text-gray-600">Aprenda metodologia científica, análise crítica e redação acadêmica.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Construa seu Currículo</h3>
                    <p className="text-gray-600">Adicione experiência em pesquisa ao seu portfólio acadêmico e profissional.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Networking Acadêmico</h3>
                    <p className="text-gray-600">Conecte-se com professores e outros pesquisadores da sua área.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Preparação para Pós-graduação</h3>
                    <p className="text-gray-600">Base sólida para mestrado, doutorado e carreira acadêmica.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl">
              <div className="text-center">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">{projetosTotal}</div>
                    <div className="text-sm text-gray-600">Projetos Ativos/Realizados</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-1">{orientadoresTotal}</div>
                    <div className="text-sm text-gray-600">Orientadores</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">{alunosTotal}</div>
                    <div className="text-sm text-gray-600">Alunos Participantes</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-600 mb-1">{projetosFinalizados}</div>
                    <div className="text-sm text-gray-600">Contribuições Científicas</div>
                  </div>
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Comece sua Jornada Científica</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para começar sua iniciação científica?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de alunos que já estão desenvolvendo projetos inovadores no IBMEC.
          </p>
          <button
            onClick={handleLogin}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg flex items-center space-x-2 mx-auto"
          >
            <LogIn className="h-5 w-5" />
            <span>Entrar no Portal</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <GraduationCap className="h-8 w-8 text-blue-400 mr-3" />
                <h3 className="text-lg font-semibold">Portal IC IBMEC</h3>
              </div>
              <p className="text-gray-400">
                Plataforma de gestão de projetos de iniciação científica do IBMEC.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button type="button" className="hover:text-white">Como Participar</button></li>
                <li><button type="button" className="hover:text-white">Regulamento</button></li>
                <li><button type="button" className="hover:text-white">Orientadores</button></li>
                <li><button type="button" className="hover:text-white">Projetos em Destaque</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-gray-400">
                <li>📧 ic@ibmec.edu.br</li>
                <li>📞 (11) 2108-8000</li>
                <li>📍 IBMEC São Paulo - Faria Lima</li>
                <li>🕒 Seg-Sex: 8h às 18h</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 IBMEC. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;