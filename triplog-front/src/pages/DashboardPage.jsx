import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState({ title: '', destination: '', description: '', startDate: '', endDate: '' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/trips')
      .then(res => setTrips(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await api.post('/trips', form);
      setTrips([res.data.trip, ...trips]);
      setForm({ title: '', destination: '', description: '', startDate: '', endDate: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Supprimer ce voyage et toutes ses étapes ?')) return;
    await api.delete(`/trips/${id}`);
    setTrips(trips.filter(t => t.id !== id));
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <div className="page fade-up">
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            Mes voyages
          </h1>
          <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem' }}>
            Bonjour, <strong>{user?.username}</strong> — {trips.length} voyage{trips.length !== 1 ? 's' : ''} enregistré{trips.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          {showForm ? '✕ Annuler' : '+ Nouveau voyage'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card fade-up" style={{ marginBottom: '2rem', borderTop: '3px solid var(--coral)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Nouveau voyage</h2>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Titre *</label>
                <input className="input-field" placeholder="Ex: Voyage au Japon" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Destination</label>
                <input className="input-field" placeholder="Ex: Tokyo" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Description</label>
                <input className="input-field" placeholder="Quelques mots sur ce voyage…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Date de départ</label>
                <input className="input-field" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Date de retour</label>
                <input className="input-field" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={creating} style={{ opacity: creating ? 0.7 : 1 }}>
              {creating ? 'Création…' : 'Créer le voyage'}
            </button>
          </form>
        </div>
      )}

      {/* Trip list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-light)' }}>Chargement…</div>
      ) : trips.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--ink-light)' }}>Aucun voyage pour l'instant</h2>
          <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem' }}>Cliquez sur « Nouveau voyage » pour commencer l'aventure.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {trips.map((trip, i) => (
            <TripCard
              key={trip.id}
              trip={trip}
              delay={i * 60}
              onClick={() => navigate(`/trips/${trip.id}`)}
              onDelete={(e) => handleDelete(trip.id, e)}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TripCard({ trip, delay, onClick, onDelete, formatDate }) {
  const stepCount = trip.Steps?.length || 0;
  return (
    <div
      className="card fade-up"
      style={{
        cursor: 'pointer',
        animationDelay: `${delay}ms`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        transition: 'box-shadow 0.2s, transform 0.2s',
        borderLeft: '4px solid var(--teal)',
      }}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          {trip.countryFlag && <span style={{ fontSize: '1.3rem' }}>{trip.countryFlag}</span>}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {trip.title}
          </h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--ink-light)' }}>
          {trip.destination && <span>📍 {trip.destination}</span>}
          {trip.startDate && (
            <span>📅 {formatDate(trip.startDate)}{trip.endDate ? ` → ${formatDate(trip.endDate)}` : ''}</span>
          )}
          {trip.currency && <span>💰 {trip.currency}</span>}
          {trip.language && <span>🗣️ {trip.language}</span>}
          <span style={{ color: 'var(--teal)', fontWeight: 500 }}>
            {stepCount} étape{stepCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}
          onClick={(e) => { e.stopPropagation(); window.location.href = `/trips/${trip.id}`; }}
        >
          Voir →
        </button>
        <button className="btn-danger" onClick={onDelete} style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}>
          🗑
        </button>
      </div>
    </div>
  );
}