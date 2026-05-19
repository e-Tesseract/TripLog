import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useTripDetail(id) {
  const [trip, setTrip] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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