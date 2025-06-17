// Configurações da aplicação
export const config = {
  // URL da API - ajuste conforme o ambiente
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net'
    : 'http://localhost:8000',
  
  API_VERSION: '/api/v1',
  
  // URLs completas dos endpoints principais
  get API_URL() {
    return `${this.API_BASE_URL}${this.API_VERSION}`;
  },
  
  get AUTH_URL() {
    return `${this.API_URL}/auth`;
  },
  
  get PROJETOS_URL() {
    return `${this.API_URL}/projetos`;
  },
  
  get PERFIS_URL() {
    return `${this.API_URL}/perfis`;
  },
  
  get DOCUMENTOS_URL() {
    return `${this.API_URL}/documentos`;
  },
  
  // Token storage key
  TOKEN_KEY: 'token',
  
  // Welcome modal keys
  WELCOME_MODAL_KEYS: {
    ALUNO: 'welcome_modal_dismissed_aluno',
    PROFESSOR: 'welcome_modal_dismissed_professor',
    ADMIN: 'welcome_modal_dismissed_admin'
  }
};

export default config;
