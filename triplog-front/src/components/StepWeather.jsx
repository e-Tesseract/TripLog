import { useStepWeather } from '../hooks/useStepWeather';
import { useTranslation } from 'react-i18next';

/**
 * Composant pour afficher les prévisions météorologiques d'une étape de voyage.
 * @param {Object} step - L'étape de voyage pour laquelle afficher la météo.
 * @returns {JSX.Element} Le composant StepWeather.
 */
export default function StepWeather({ step }) {
  const { forecast, loading } = useStepWeather(step);
  const { t, i18n } = useTranslation();
 
  if (!step.latitude || !step.longitude) return null;
  if (loading) return <p className="muted mt-1">{t('stepWeather.loading')}</p>;
  if (forecast.length === 0) {
    return (
      <p className="muted mt-1">{t('stepWeather.unavailable')}</p>
    );
  }
 
  return (
    <div className="mt-1">
      <p className="muted" style={{ marginBottom: '0.4rem' }}>{t('stepWeather.forecast')}</p>
      <div className="weather-grid">
        {forecast.map((day) => (
          <div key={day.date} className="weather-day">
            <div className="weather-day-name">{formatDate(day.date, i18n.language)}</div>
            <div className="weather-day-desc">{day.descriptionMeteo}</div>
            <div className="weather-day-temp">{day.temperatureMin}° / {day.temperatureMax}°</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Fonction pour formater une date au format "jour mois" en français.
 * @param {string} dateStr - La date à formater.
 * @returns {string} La date formatée.
 */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}