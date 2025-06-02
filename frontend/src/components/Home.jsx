import React from 'react';
import { GraduationCap, Users, BookOpen, Award, CheckCircle, ArrowRight, LogIn, Search, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    window.location.href = 'http://localhost:8000/api/v1/auth/microsoft-login';
  };

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
              Portal de Iniciação Científica
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Conecte-se com orientadores, desenvolva projetos inovadores e dê os primeiros passos na sua carreira de pesquisador.
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
            {/* Passo 1 */}
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

            {/* Passo 2 */}
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

            {/* Passo 3 */}
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
                    <div className="text-3xl font-bold text-blue-600 mb-1">150+</div>
                    <div className="text-sm text-gray-600">Projetos Ativos</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-1">45+</div>
                    <div className="text-sm text-gray-600">Orientadores</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">300+</div>
                    <div className="text-sm text-gray-600">Alunos Participantes</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-600 mb-1">95%</div>
                    <div className="text-sm text-gray-600">Taxa de Satisfação</div>
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
                <li><a href="#" className="hover:text-white">Como Participar</a></li>
                <li><a href="#" className="hover:text-white">Regulamento</a></li>
                <li><a href="#" className="hover:text-white">Orientadores</a></li>
                <li><a href="#" className="hover:text-white">Projetos em Destaque</a></li>
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