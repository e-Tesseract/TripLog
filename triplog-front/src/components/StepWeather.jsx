import { useStepWeather } from '../hooks/useStepWeather';

/**
 * Affiche la météo disponible pour la période d'une étape.
 * Si aucun jour ne tombe dans la fenêtre de prévision (7 jours),
 * affiche un message informatif.
 */
export default function StepWeather({ step }) {
  const { forecast, loading } = useStepWeather(step);

  if (!step.latitude || !step.longitude) return null;
  if (loading) return <p className="muted mt-1">Chargement météo…</p>;
  if (forecast.length === 0) {
    return (
      <p className="muted mt-1">
        🌤️ Météo non disponible pour ces dates (prévisions limitées à 7 jours).
      </p>
    );
  }

  return (
    <div className="mt-1">
      <p className="muted" style={{ marginBottom: '0.4rem' }}>🌤️ Météo prévue :</p>
      <div className="weather-grid">
        {forecast.map((day) => (
          <div key={day.date} className="weather-day">
            <div className="weather-day-name">{formatDate(day.date)}</div>
            <div className="weather-day-desc">{day.descriptionMeteo}</div>
            <div className="weather-day-temp">{day.temperatureMin}° / {day.temperatureMax}°</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}