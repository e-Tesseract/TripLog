import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Récupère les prévisions météorologiques pour une étape donnée.
 * @param {Object} step - L'étape pour laquelle récupérer les prévisions météorologiques.
 * @returns {Object} Un objet contenant les prévisions météorologiques et l'état de chargement.
 */
export function useStepWeather(step) {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!step.latitude || !step.longitude) return;

    /**
     * Récupère les prévisions météorologiques pour l'étape actuelle. Effectue une requête à l'API avec les coordonnées de l'étape, puis filtre les résultats pour ne garder que les jours correspondant aux dates d'arrivée et de départ de l'étape. Si aucune date d'arrivée n'est fournie, affiche toutes les prévisions disponibles.
     */
    async function fetchWeather() {
      setLoading(true);
      try {
        // Effectue une requête à l'API pour récupérer les prévisions météorologiques pour les coordonnées de l'étape
        const res = await api.get(`/cities/meteo?lat=${step.latitude}&lon=${step.longitude}`);
        
        // Récupère les prévisions météorologiques de la réponse de l'API
        const days = res.data;

        // Filtre les prévisions pour ne garder que celles correspondant aux dates d'arrivée et de départ de l'étape
        const arrival = step.arrivalDate ? step.arrivalDate.slice(0, 10) : null;
        const departure = step.departureDate ? step.departureDate.slice(0, 10) : arrival;

        // Si aucune date d'arrivée n'est fournie, affiche toutes les prévisions disponibles
        if (!arrival) {
          setForecast(days);
          return;
        }
        // Filtre les prévisions pour ne garder que celles correspondant aux dates d'arrivée et de départ de l'étape
        const filtered = days.filter((day) => day.date >= arrival && day.date <= departure);
        setForecast(filtered);
      } catch {
        setForecast([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [step.latitude, step.longitude, step.arrivalDate, step.departureDate]);

  return { forecast, loading };
}