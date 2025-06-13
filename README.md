# 🎓 PICT IBMEC

## 📌 Descrição
Sistema completo de autenticação e dashboards para professores e alunos do IBMEC usando Microsoft Azure AD.

## 🌐 URL do Projeto
- Acesse localmente: [http://localhost:3000/login](http://localhost:3000/login)
- Página oficial: [https://blog.ibmec.br/conteudo-gratuito/fique-por-dentro-inscricoes-abertas-para-o-pict-2025-ibmec-sp/](https://blog.ibmec.br/conteudo-gratuito/fique-por-dentro-inscricoes-abertas-para-o-pict-2025-ibmec-sp/)
- Frontend: https://polite-forest-080c3b31e.2.azurestaticapps.net/

## ⚙️ Tecnologias Utilizadas

### Backend (FastAPI)
- **Banco de Dados**: SQLite
- **Autenticação**: OAuth2 com Microsoft Azure AD

### Frontend (React)
- **Estilo**: Tailwind CSS

## 🚀 Instalação e Execução

### 1. Backend (FastAPI)
```bash
cd backend

# Instalar dependências
pip install -r requirements.txt

# Configurar banco de dados
python database_setup.py

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações do Azure AD

# Executar
python main.py
```

### 2. Frontend (React)
```bash
cd frontend

# Instalar dependências
npm install

# Executar
npm start
```

## 🔧 Configuração Azure AD
1. **Criar aplicação no Azure AD**
2. **Configurar URI de redirecionamento**: 
3. **Adicionar permissões**: 
4. **Configurar `.env`**

## 📱 Funcionalidades
- ✅ Login automático com Microsoft Azure AD
- ✅ Criação automática de usuários no banco
- ✅ Dashboards diferenciados para professores e alunos  
- ✅ Interface responsiva e moderna
- ✅ Segurança com JWT tokens

## 🎯 Como Usar
1. Configure o Azure AD.
2. Execute o backend e o frontend.
3. Faça login com credenciais @ibmec.edu.br.
4. Seja redirecionado para o dashboard apropriado.

## 📊 Estrutura
- **Backend**: FastAPI + SQLite + JWT
- **Frontend**: React + Tailwind CSS
- **Autenticação**: Microsoft OAuth2
- **Banco**: SQLite com criação automática

---

🎉 **Pronto para usar!** Sistema completo de autenticação IBMEC.



# 📄 Documentação Técnica

## 🏗️ Arquitetura do Sistema

O sistema é dividido em duas camadas principais: **Frontend** e **Backend**, com integração de serviços cloud para autenticação, hospedagem e gerenciamento de dados. A arquitetura segue o padrão **MVC (Model-View-Controller)** e utiliza serviços da Microsoft Azure para garantir escalabilidade e segurança.

### **Arquitetura Geral**
1. **Frontend**: Desenvolvido em React, responsável pela interface do usuário. Hospedado como uma **Azure Static Web App**.
2. **Backend**: Desenvolvido em FastAPI, responsável por gerenciar a lógica de negócios, autenticação e comunicação com o banco de dados. Hospedado como um **Azure Web App**.
3. **Banco de Dados**: SQLite, utilizado para armazenar informações de usuários, projetos e atividades.
4. **Serviços Cloud**: Microsoft Azure AD para autenticação segura via OAuth2.

---

## ☁️ Serviços Cloud Utilizados

### **Microsoft Azure Active Directory (Azure AD)**
- **Função**: Autenticação de usuários.
- **Descrição**: O Azure AD é utilizado para autenticar alunos e professores com suas credenciais institucionais (@ibmec.edu.br). Ele fornece tokens JWT para acesso seguro ao sistema.
- **Configuração**:
  - URI de redirecionamento: `http://localhost:8000/api/v1/auth/callback`
  - Permissões: `User.Read`, `openid`, `profile`, `email`

### **Azure Static Web App**
- **Função**: Hospedagem do frontend.
- **Descrição**: O frontend React é hospedado como uma aplicação estática na Azure Static Web App, garantindo alta disponibilidade e desempenho.
- **Configuração**:
  - Conexão com repositório GitHub para deploy automático.
  - Configuração de domínio personalizado (opcional).

### **Azure Web App**
- **Função**: Hospedagem do backend.
- **Descrição**: O backend FastAPI é hospedado como um aplicativo web na Azure Web App, permitindo escalabilidade e integração com outros serviços Azure.
- **Configuração**:
  - Deploy via GitHub Actions ou manual.
  - Configuração de variáveis de ambiente para autenticação e banco de dados.

---

## 📂 Estrutura do Projeto

### **Frontend**
- **Tecnologia**: React
- **Estilo**: Tailwind CSS
- **Estrutura**:
  ```
  frontend/
  ├── src/
  │   ├── components/       # Componentes reutilizáveis (ex.: Dashboard, Modais)
  │   ├── pages/            # Páginas principais (ex.: Login, Dashboard)
  │   ├── utils/            # Funções auxiliares (ex.: fetchAuth)
  │   ├── App.jsx           # Componente principal
  │   └── index.js          # Ponto de entrada do React
  ├── public/               # Arquivos estáticos
  └── package.json          # Dependências do projeto
  ```

### **Backend**
- **Tecnologia**: FastAPI
- **Estrutura**:
  ```
  backend/
  ├── app/
  │   ├── models/           # Modelos do banco de dados (ex.: User, Projeto)
  │   ├── routes/           # Rotas da API (ex.: /auth, /projetos)
  │   ├── services/         # Lógica de negócios (ex.: autenticação, aprovação)
  │   ├── utils/            # Funções auxiliares (ex.: validação de tokens)
  │   ├── main.py           # Ponto de entrada do FastAPI
  │   └── database_setup.py # Configuração do banco de dados
  ├── .env.example          # Variáveis de ambiente
  └── requirements.txt      # Dependências do projeto
  ```

---

## 🔧 Fluxo de Operação

1. **Autenticação**:
   - O usuário acessa o sistema e é redirecionado para o Azure AD.
   - Após autenticação, o Azure AD retorna um token JWT.
   - O token é usado para acessar as APIs protegidas do backend.

2. **Hospedagem**:
   - O frontend é hospedado como uma **Azure Static Web App**, garantindo alta disponibilidade.
   - O backend é hospedado como um **Azure Web App**, permitindo escalabilidade e integração com outros serviços.

3. **Gerenciamento de Projetos**:
   - Professores podem aprovar ou rejeitar projetos submetidos por alunos.
   - Alunos podem enviar atividades e documentos relacionados aos projetos.

4. **Armazenamento**:
   - Dados estruturados (usuários, projetos) são armazenados no SQLite.
   - Documentos podem ser armazenados em serviços adicionais, como Azure Blob Storage (opcional).

---

🎯 **Resumo**: O sistema utiliza uma arquitetura moderna e escalável, com integração de serviços cloud para autenticação, hospedagem e gerenciamento de dados. A estrutura do projeto é organizada para facilitar o desenvolvimento e manutenção.
