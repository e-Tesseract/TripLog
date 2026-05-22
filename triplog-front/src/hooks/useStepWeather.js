import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useStepWeather(step) {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!step.latitude || !step.longitude) return;

    async function fetchWeather() {
      setLoading(true);
      try {
        const res = await api.get(`/cities/meteo?lat=${step.latitude}&lon=${step.longitude}`);
        const days = res.data;
        const arrival = step.arrivalDate ? step.arrivalDate.slice(0, 10) : null;
        const departure = step.departureDate ? step.departureDate.slice(0, 10) : arrival;
        if (!arrival) {
          setForecast(days);
          return;
        }
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