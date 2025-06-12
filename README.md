# PICTIbmecFinal

# 🛡️ Sistema de controle para projetos de Iniciação Cientifica IBMEC

## 📌 Descrição
Sistema completo de autenticação para alunos e professores do IBMEC, com login via Microsoft Azure AD e dashboards. 

## 🌐 URL do Projeto:
Acesse localmente: [http://localhost:3000/login](http://localhost:3000/login)

## 🌐 URL Base:
Página IBEMC: (https://blog.ibmec.br/conteudo-gratuito/fique-por-dentro-inscricoes-abertas-para-o-pict-2025-ibmec-sp/)

## ⚙️ Tecnologias Utilizadas

### 1. Backend (FastAPI)
- SQLite 

### 2. Frontend (React)

### Autenticação:
- OAuth2 com Microsoft Azure AD



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
2. **Configurar URI de redirecionamento**: `http://localhost:8000/api/v1/auth/callback`
3. **Adicionar permissões**: User.Read, openid, profile, email
4. **Configurar .env** com Client ID, Secret e Tenant ID

## 📱 Funcionalidades

- ✅ Login automático com Microsoft Azure AD
- ✅ Criação automática de usuários no banco
- ✅ Dashboards diferenciados para professores e alunos  
- ✅ Interface responsiva e moderna
- ✅ Segurança com JWT tokens

## 🎯 Como Usar

1. Configure o Azure AD
2. Execute backend e frontend
3. Acesse `http://localhost:3000/login`
4. Faça login com credenciais @ibmec.edu.br
5. Seja redirecionado para o dashboard apropriado

## 📊 Estrutura

- **Backend**: FastAPI + SQLite + JWT
- **Frontend**: React + Tailwind CSS
- **Autenticação**: Microsoft OAuth2
- **Banco**: SQLite com criação automática

---

🎉 **Pronto para usar!** Sistema completo de autenticação IBMEC.
