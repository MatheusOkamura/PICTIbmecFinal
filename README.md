# PICTIbmecFinal

# 🛡️ Sistema de Autenticação IBMEC

## 📌 Descrição
Sistema completo de autenticação para alunos e professores do IBMEC, com login via Microsoft Azure AD e dashboards diferenciados por tipo de usuário. Desenvolvido com foco em segurança, automação e experiência moderna.

## 🌐 URL do Projeto
Acesse localmente: [http://localhost:3000/login](http://localhost:3000/login)

> *(Se tiver deploy em Vercel ou outro lugar, coloca o link aqui também!)*

---

## ⚙️ Tecnologias Utilizadas

### Backend:
- [FastAPI](https://fastapi.tiangolo.com/)
- SQLite (com criação automática)
- JWT (para autenticação segura)

### Frontend:
- [React.js](https://reactjs.org/)
- Tailwind CSS

### Autenticação:
- OAuth2 com Microsoft Azure AD

---

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
# Edite o .env com suas credenciais do Azure AD

# Executar o servidor
python main.py
