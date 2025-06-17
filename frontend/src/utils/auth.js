import config from './config';

/**
 * Utilitário para fazer requisições autenticadas
 */
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem(config.TOKEN_KEY);
  
  // Se não há token, redirecionar para login
  if (!token) {
    window.location.href = '/login';
    throw new Error('Token não encontrado');
  }

  // Verificar se o token expirou
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem(config.TOKEN_KEY);
      window.location.href = '/login';
      throw new Error('Token expirado');
    }
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    localStorage.removeItem(config.TOKEN_KEY);
    window.location.href = '/login';
    throw new Error('Token inválido');
  }

  // Fazer a requisição com o token
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  // Se unauthorized, redirecionar para login
  if (response.status === 401) {
    localStorage.removeItem(config.TOKEN_KEY);
    window.location.href = '/login';
    throw new Error('Não autorizado');
  }

  return response;
};

/**
 * Utilitário para obter informações do usuário atual
 */
export const getCurrentUser = () => {
  const token = localStorage.getItem(config.TOKEN_KEY);
  
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Verificar se o token expirou
    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem(config.TOKEN_KEY);
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    localStorage.removeItem(config.TOKEN_KEY);
    return null;
  }
};

/**
 * Utilitário para fazer logout
 */
export const logout = () => {
  // Limpar todos os dados do usuário
  Object.values(config.WELCOME_MODAL_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  localStorage.removeItem(config.TOKEN_KEY);
  
  // Redirecionar para login
  window.location.href = '/login';
};

export default {
  authFetch,
  getCurrentUser,
  logout
};
