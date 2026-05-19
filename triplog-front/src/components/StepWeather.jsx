import { useStepWeather } from '../hooks/useStepWeather';

/**
 * Affiche la météo disponible pour la période d'une étape.
 * Si aucun jour ne tombe dans la fenêtre de prévision (7 jours),
 * affiche un message informatif plutôt qu'un bloc vide.
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {forecast.map((day) => (
          <div key={day.date} style={{
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            padding: '0.4rem 0.7rem',
            fontSize: '0.82rem',
            background: '#fafafa',
            minWidth: '100px',
          }}>
            <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>
              {formatDate(day.date)}
            </div>
            <div>{day.descriptionMeteo}</div>
            <div className="muted">
              {day.temperatureMin}° / {day.temperatureMax}°
            </div>
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