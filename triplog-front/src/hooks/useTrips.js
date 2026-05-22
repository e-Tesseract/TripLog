import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/trips')
      .then((res) => setTrips(res.data))
      .catch(() => setError('Impossible de charger les voyages.'))
      .finally(() => setLoading(false));
  }, []);

  return { trips, setTrips, loading, error };
}