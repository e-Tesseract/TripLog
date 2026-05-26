import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Hook pour récupérer la liste des voyages de l'utilisateur connecté. 
 * Effectue une requête à l'API pour récupérer les voyages, et gère l'état de chargement et les erreurs éventuelles. 
 * Retourne la liste des voyages, une fonction pour mettre à jour cette liste, l'état de chargement et les erreurs.
 * @returns {Object} Un objet contenant la liste des voyages, une fonction pour mettre à jour cette liste, l'état de chargement et les erreurs éventuelles.
 */
export function useTrips() {
  // Initialise l'état pour la liste des voyages, l'état de chargement et les erreurs
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Récupère la liste des voyages lorsque le composant est monté
  useEffect(() => {
    api.get('/trips')
      .then((res) => setTrips(res.data))
      .catch(() => setError('Impossible de charger les voyages.'))
      .finally(() => setLoading(false));
  }, []);

  return { trips, setTrips, loading, error };
}