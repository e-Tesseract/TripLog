import { useState, useRef } from 'react';
import api from '../api/axios';

/**
 * Hook personnalisé pour la recherche de villes avec autocomplétion. Fournit une fonction de recherche qui effectue une requête à l'API pour récupérer les villes correspondant à la query, et gère l'état des résultats et du chargement. Utilise un délai de 300ms pour éviter de faire trop de requêtes pendant que l'utilisateur tape.
 * @return {Object} Un objet contenant les résultats de la recherche, l'état de chargement, la fonction de recherche et la fonction pour effacer les résultats.
 */
export function useCitySearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  /**
   * Recherche les villes correspondant à la query.
   * @param {string} query - La chaîne de recherche.
   * @returns {Promise<void>}
   */
  function search(query) {
    clearTimeout(timeoutRef.current);

    // Si l'utilisateur a tapé moins de 2 caractères, ne pas faire de requête
    if (query.length < 2) { setResults([]); return; }

    // Utilise un délai de 300ms pour éviter de faire trop de requêtes pendant que l'utilisateur tape
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Effectue une requête à l'API pour récupérer les villes correspondant à la query
        const res = await api.get(`/cities/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch {
        // En cas d'erreur, efface les résultats pour indiquer qu'aucune ville n'a été trouvée
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  /**
   * Efface les résultats de la recherche. Utile pour réinitialiser la liste des résultats lorsque l'utilisateur sélectionne une ville ou efface le champ de recherche.
   */
  function clearResults() {
    setResults([]);
  }

  // Retourne les résultats de la recherche, l'état de chargement, la fonction de recherche et la fonction pour effacer les résultats.
  return { results, loading, search, clearResults };
}