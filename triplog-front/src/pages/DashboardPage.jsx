import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../hooks/useTrips';
import api from '../api/axios';

const emptyForm = { title: '', destination: '', description: '', startDate: '', endDate: '' };

function tripToForm(trip) {
  return {
    title: trip.title || '',
    destination: trip.destination || '',
    description: trip.description || '',
    startDate: trip.startDate ? trip.startDate.slice(0, 10) : '',
    endDate: trip.endDate ? trip.endDate.slice(0, 10) : '',
  };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { trips, setTrips, loading, error } = useTrips();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  // id du voyage en cours d'édition (null = aucun)
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const res = await api.post('/trips', createForm);
      setTrips([res.data.trip, ...trips]);
      setCreateForm(emptyForm);
      setShowCreateForm(false);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(trip) {
    setEditingId(trip.id);
    setEditForm(tripToForm(trip));
    setEditError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
    setEditError('');
  }

  async function handleUpdate(e, id) {
    e.preventDefault();
    setEditError('');
    setSaving(true);
    try {
      const res = await api.put(`/trips/${id}`, editForm);
      setTrips(trips.map((t) => (t.id === id ? res.data.trip : t)));
      cancelEdit();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Erreur lors de la modification.');
    } finally {
      setSaving(false);
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
        <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Annuler' : '+ Nouveau voyage'}
        </button>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <div className="card">
          <h2 className="mb-2">Nouveau voyage</h2>
          {createError && <p className="error">{createError}</p>}
          <form onSubmit={handleCreate}>
            <TripFormFields form={createForm} setForm={setCreateForm} />
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
            {editingId === trip.id ? (
              // Formulaire d'édition inline
              <>
                <h2 className="mb-2">Modifier le voyage</h2>
                {editError && <p className="error">{editError}</p>}
                <form onSubmit={(e) => handleUpdate(e, trip.id)}>
                  <TripFormFields form={editForm} setForm={setEditForm} />
                  <div className="row">
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                      {saving ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                    <button className="btn btn-secondary" type="button" onClick={cancelEdit}>
                      Annuler
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // Affichage normal
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
                  <button className="btn btn-secondary" onClick={() => startEdit(trip)}>
                    Modifier
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(trip.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// Champs du formulaire partagés entre création et édition
function TripFormFields({ form, setForm }) {
  return (
    <>
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
    </>
  );
}