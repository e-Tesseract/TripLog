import { createContext, useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext(null);

/**
 * Vérifie si un token JWT est expiré.
 * @param {string} token
 * @returns {boolean}
 */
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

/**
 * Restaure la session depuis le localStorage si le token est encore valide.
 * @returns {{ user: object, token: string } | { user: null, token: null }}
 */
function restoreSession() {
  const token = localStorage.getItem('token');
  const stored = localStorage.getItem('user');

  if (!token || !stored || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { user: null, token: null };
  }

  return { user: JSON.parse(stored), token };
}

/**
 * Fournisseur de contexte d'authentification.
 * Gère la session utilisateur, le renouvellement automatique du token,
 * et l'injection du token dans les headers Axios.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => restoreSession().user);
  const [token, setToken] = useState(() => restoreSession().token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Déconnecte l'utilisateur et nettoie le localStorage.
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  /**
   * Renouvelle le token JWT via l'API.
   * Déconnecte l'utilisateur si le renouvellement échoue.
   */
  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post('/users/refresh', { token });
      const { newToken } = response.data;
      setToken(newToken);
      localStorage.setItem('token', newToken);
    } catch {
      logout();
    }
  }, [token, logout]);

  /**
   * Connecte l'utilisateur à partir de ses identifiants.
   * Stocke le token et les données utilisateur dans le localStorage.
   * @param {Object} credentials - { email, password }
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/users/login', credentials);
      const { user: userData, token: newToken } = response.data;

      setUser(userData);
      setToken(newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', newToken);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  }, []);

  // Renouvellement automatique du token toutes les 15 minutes
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(refreshToken, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, refreshToken]);

  // Injection du token dans les headers Axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
