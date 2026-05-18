import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CitySearch from '../components/CitySearch';

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [steps, setSteps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ city: '', notes: '', arrivalDate: '', departureDate: '', latitude: '', longitude: '' });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get(`/trips/${id}`)
      .then(res => {
        setTrip(res.data);
        setSteps(res.data.Steps || []);
      })
      .catch(() => navigate('/'));
  }, [id]);

  const handleCitySelect = (city) => {
    setForm(f => ({ ...f, city: city.nom, latitude: city.latitude, longitude: city.longitude }));
  };

  const handleCreateStep = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await api.post(`/trips/${id}/steps`, form);
      setSteps(prev => [...prev, res.data.step].sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate)));
      setForm({ city: '', notes: '', arrivalDate: '', departureDate: '', latitude: '', longitude: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStep = async (stepId) => {
    if (!confirm('Supprimer cette étape ?')) return;
    await api.delete(`/trips/${id}/steps/${stepId}`);
    setSteps(steps.filter(s => s.id !== stepId));
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  if (!trip) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-light)' }}>Chargement…</div>
  );

  return (
    <div className="page fade-up">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 500,
          fontSize: '0.9rem', cursor: 'pointer', padding: 0, marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.3rem'
        }}
      >
        ← Retour aux voyages
      </button>

      {/* Trip header */}
      <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid var(--coral)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              {trip.countryFlag && <span style={{ fontSize: '2rem' }}>{trip.countryFlag}</span>}
              <h1 style={{ fontSize: '1.8rem' }}>{trip.title}</h1>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.88rem', color: 'var(--ink-light)' }}>
              {trip.destination && <span>📍 {trip.destination}</span>}
              {trip.startDate && <span>📅 {formatDate(trip.startDate)}{trip.endDate ? ` → ${formatDate(trip.endDate)}` : ''}</span>}
              {trip.currency && <span>💰 {trip.currency}</span>}
              {trip.language && <span>🗣️ {trip.language}</span>}
            </div>
            {trip.description && (
              <p style={{ marginTop: '0.75rem', color: 'var(--ink-light)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                {trip.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Steps header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.4rem' }}>
          Étapes <span style={{ fontSize: '0.9rem', color: 'var(--ink-light)', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>({steps.length})</span>
        </h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Annuler' : '+ Ajouter une étape'}
        </button>
      </div>

      {/* Step form */}
      {showForm && (
        <div className="card fade-up" style={{ marginBottom: '1.5rem', borderTop: '3px solid var(--teal)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.1rem' }}>Nouvelle étape</h3>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleCreateStep}>
            <div className="form-group">
              <label className="label">Ville *</label>
              <CitySearch onSelect={handleCitySelect} initialValue={form.city} />
              {form.city && (
                <p style={{ fontSize: '0.8rem', color: 'var(--teal)', marginTop: '0.35rem' }}>
                  ✅ {form.city} {form.latitude ? `(${parseFloat(form.latitude).toFixed(2)}, ${parseFloat(form.longitude).toFixed(2)})` : ''}
                </p>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="label">Date d'arrivée *</label>
                <input className="input-field" type="date" required value={form.arrivalDate} onChange={e => setForm({ ...form, arrivalDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Date de départ</label>
                <input className="input-field" type="date" value={form.departureDate} onChange={e => setForm({ ...form, departureDate: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Notes</label>
              <input className="input-field" placeholder="Impressions, activités, anecdotes…" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary" disabled={creating || !form.city} style={{ opacity: (creating || !form.city) ? 0.6 : 1 }}>
              {creating ? 'Création…' : 'Ajouter l\'étape'}
            </button>
          </form>
        </div>
      )}

      {/* Steps list */}
      {steps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📍</div>
          <p style={{ color: 'var(--ink-light)' }}>Aucune étape pour ce voyage.</p>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute', left: 16, top: 8, bottom: 8,
            width: 2, background: 'var(--sand-dark)', borderRadius: 2
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {steps.map((step, i) => (
              <StepCard key={step.id} step={step} index={i} onDelete={handleDeleteStep} formatDate={formatDate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StepCard({ step, index, onDelete, formatDate }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      {/* Timeline dot */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'var(--teal)', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
        boxShadow: '0 0 0 4px var(--sand)',
        zIndex: 1,
      }}>
        {index + 1}
      </div>

      {/* Card */}
      <div className="card fade-up" style={{ flex: 1, animationDelay: `${index * 50}ms`, padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.3rem' }}>📍 {step.city}</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-light)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {step.arrivalDate && (
                <span>📅 {formatDate(step.arrivalDate)}{step.departureDate ? ` → ${formatDate(step.departureDate)}` : ''}</span>
              )}
              {step.weatherInfo && <span>🌤️ {step.weatherInfo}</span>}
            </div>
            {step.notes && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.88rem', color: 'var(--ink)', fontStyle: 'italic' }}>
                "{step.notes}"
              </p>
            )}
          </div>
          <button className="btn-danger" onClick={() => onDelete(step.id)} style={{ flexShrink: 0, padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}>
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}