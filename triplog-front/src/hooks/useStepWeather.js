import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Récupère les prévisions météo pour une étape.
 * Filtre uniquement les jours compris entre arrivalDate et departureDate.
 * Ne fait rien si l'étape n'a pas de coordonnées.
 */
export function useStepWeather(step) {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!step.latitude || !step.longitude) return;

    setLoading(true);
    api
      .get(`/cities/meteo?lat=${step.latitude}&lon=${step.longitude}`)
      .then((res) => {
        const days = res.data;

        // Garde uniquement les jours dans la période de l'étape
        const arrival = step.arrivalDate ? step.arrivalDate.slice(0, 10) : null;
        const departure = step.departureDate ? step.departureDate.slice(0, 10) : arrival;

        if (!arrival) {
          setForecast(days);
          return;
        }

        const filtered = days.filter((day) => day.date >= arrival && day.date <= departure);
        setForecast(filtered);
      })
      .catch(() => setForecast([]))
      .finally(() => setLoading(false));
  }, [step.latitude, step.longitude, step.arrivalDate, step.departureDate]);

  return { forecast, loading };
}