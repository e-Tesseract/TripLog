import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Hook personnalisé pour récupérer les détails d'un voyage.
 * @param {number} id - L'ID du voyage à récupérer.
 * @returns {Object} Un objet contenant les détails du voyage, les étapes associées, l'état de chargement et les erreurs éventuelles.
 */
export function useTripDetail(id) {
  const [trip, setTrip] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Récupère les détails du voyage et les étapes associées lorsque le composant est monté ou lorsque l'ID du voyage change
  useEffect(() => {
    api.get(`/trips/${id}`)
      .then((res) => {
        setTrip(res.data);
        setSteps(res.data.Steps || []);
      })
      .catch(() => setError('Voyage introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  return { trip, steps, setSteps, loading, error };
}