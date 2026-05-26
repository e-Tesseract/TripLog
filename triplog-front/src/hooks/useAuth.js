import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook pour accéder au contexte d'authentification. Permet aux composants de récupérer les données de l'utilisateur connecté et les fonctions de connexion/déconnexion fournies par le AuthProvider.
 * @returns {Object} Un objet contenant les données de l'utilisateur connecté et les fonctions de connexion/déconnexion.
 */
export function useAuth() {
  return useContext(AuthContext);
}