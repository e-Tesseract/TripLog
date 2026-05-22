import { useTranslation } from 'react-i18next';

export default function TripCard({ trip, onClick, onDelete }) {
  const { t } = useTranslation();

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={onClick}>
      <div className="row-between">
        <div>
          <h2>{trip.countryFlag} {trip.title}</h2>
          {trip.destination && <p className="muted">📍 {trip.destination}</p>}
          {trip.startDate && (
            <p className="muted">
              📅 {trip.startDate.slice(0, 10)}
              {trip.endDate ? ` → ${trip.endDate.slice(0, 10)}` : ''}
            </p>
          )}
          {trip.currency && <p className="muted">💰 {trip.currency}</p>}
          {trip.language && <p className="muted">🗣️ {trip.language}</p>}
          <p style={{ color: 'var(--teal, #0d9488)', fontWeight: 500, marginTop: '0.3rem' }}>
            {trip.Steps?.length || 0} {t('tripCard.steps')}
          </p>
        </div>

        <div className="row" onClick={e => e.stopPropagation()}>
          <button
            className="btn btn-secondary"
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            {t('tripCard.see')}
          </button>
          <button
            className="btn btn-danger"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            aria-label={t('tripCard.delete')}
          >
            {t('tripCard.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}