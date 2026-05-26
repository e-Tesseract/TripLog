import { createContext, useState } from 'react';

const AuthContext = createContext(null);
export { AuthContext };

/**
 * Fonction pour vérifier si un token JWT est expiré. Décode le token, extrait la date d'expiration et compare avec la date actuelle. Si le token est expiré ou invalide, retourne true.
 * @param {string} token - Le token JWT à vérifier.
 * @returns {boolean} true si le token est expiré ou invalide, false sinon.
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
 * Fournisseur de contexte d'authentification. Gère l'état de l'utilisateur connecté, les fonctions de connexion et de déconnexion, et stocke les données d'authentification dans localStorage pour persister entre les sessions. Lors de l'initialisation, vérifie si un token valide est présent dans localStorage pour restaurer la session de l'utilisateur.
 * @param {Object} props - Les propriétés du composant, avec children pour les composants enfants à rendre.
 * @returns {JSX.Element} Le composant AuthProvider qui enveloppe les composants enfants avec le contexte d'authentification.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (!token || !stored || isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return JSON.parse(stored);
  });

  /**
   * Gère la connexion de l'utilisateur. Lorsque l'utilisateur se connecte avec succès, stocke le token JWT et les données de l'utilisateur dans localStorage, et met à jour l'état de l'utilisateur dans le contexte.
   * @param {Object} userData - Les données de l'utilisateur connecté, généralement reçues de l'API après une connexion réussie.
   * @param {string} token - Le token JWT reçu de l'API après une connexion réussie.
   */
  function login(userData, token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  /**
   * Gère la déconnexion de l'utilisateur. Lorsque l'utilisateur se déconnecte, supprime le token JWT et les données de l'utilisateur de localStorage, et met à jour l'état de l'utilisateur dans le contexte pour indiquer qu'aucun utilisateur n'est connecté.
   */
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  // Retourne le fournisseur de contexte avec les données de l'utilisateur et les fonctions de connexion/déconnexion disponibles pour les composants enfants.
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}