import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../hooks/useTrips';
import api from '../api/axios';

const emptyForm = { title: '', destination: '', description: '', startDate: '', endDate: '' };

export default function DashboardPage() {
  const navigate = useNavigate();
  const { trips, setTrips, loading, error } = useTrips();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    try {
      const res = await api.post('/trips', form);
      setTrips([res.data.trip, ...trips]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce voyage ?')) return;
    await api.delete(`/trips/${id}`);
    setTrips(trips.filter((t) => t.id !== id));
  }

  if (loading) return <div className="page">Chargement…</div>;
  if (error) return <div className="page"><p className="error">{error}</p></div>;

  return (
    <div className="page">
      <div className="row-between mb-2">
        <h1>Mes voyages</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Nouveau voyage'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="mb-2">Nouveau voyage</h2>
          {formError && <p className="error">{formError}</p>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Titre *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Destination</label>
              <input
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Date de départ</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value, endDate: '' })}
                />
              </div>
              <div className="form-group">
                <label>Date de retour</label>
                <input
                  type="date"
                  value={form.endDate}
                  min={form.startDate || undefined}
                  disabled={!form.startDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={creating}>
              {creating ? 'Création…' : 'Créer'}
            </button>
          </form>
        </div>
      )}

      {trips.length === 0 ? (
        <p className="muted">Aucun voyage pour l&apos;instant.</p>
      ) : (
        trips.map((trip) => (
          <div className="card" key={trip.id}>
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
              </div>
              <div className="row">
                <button className="btn btn-secondary" onClick={() => navigate(`/trips/${trip.id}`)}>
                  Voir →
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(trip.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}