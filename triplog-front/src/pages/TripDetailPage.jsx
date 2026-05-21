import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTripDetail } from '../hooks/useTripDetail';
import CitySearch from '../components/CitySearch';
import StepWeather from '../components/StepWeather';
import api from '../api/axios';

const emptyForm = { city: '', notes: '', arrivalDate: '', departureDate: '', latitude: '', longitude: '' };

function stepToForm(step) {
  return {
    city: step.city || '',
    notes: step.notes || '',
    arrivalDate: step.arrivalDate ? step.arrivalDate.slice(0, 10) : '',
    departureDate: step.departureDate ? step.departureDate.slice(0, 10) : '',
    latitude: step.latitude || '',
    longitude: step.longitude || '',
  };
}

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trip, steps, setSteps, loading, error } = useTripDetail(id);

  // Création
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  // Édition
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleCitySelect(city) {
    setForm((f) => ({ ...f, city: city.nom, latitude: city.latitude, longitude: city.longitude }));
  }

  function handleEditCitySelect(city) {
    setEditForm((f) => ({ ...f, city: city.nom, latitude: city.latitude, longitude: city.longitude }));
  }

  async function handleCreateStep(e) {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    try {
      const res = await api.post(`/trips/${id}/steps`, form);
      setSteps((prev) =>
        [...prev, res.data.step].sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate))
      );
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(step) {
    setEditingId(step.id);
    setEditForm(stepToForm(step));
    setEditError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
    setEditError('');
  }

  async function handleUpdateStep(e, stepId) {
    e.preventDefault();
    setEditError('');
    setSaving(true);
    try {
      const res = await api.put(`/trips/${id}/steps/${stepId}`, editForm);
      setSteps((prev) =>
        prev
          .map((s) => (s.id === stepId ? res.data.step : s))
          .sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate))
      );
      cancelEdit();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Erreur lors de la modification.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStep(stepId) {
    if (!confirm('Supprimer cette étape ?')) return;
    await api.delete(`/trips/${id}/steps/${stepId}`);
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
  }

  if (loading) return <div className="page">Chargement…</div>;
  if (error) return <div className="page"><p className="error">{error}</p></div>;

  const tripStart = trip.startDate ? trip.startDate.slice(0, 10) : undefined;
  const tripEnd = trip.endDate ? trip.endDate.slice(0, 10) : undefined;

  return (
    <div className="page">
      <button className="btn btn-secondary mb-2" onClick={() => navigate('/')}>
        ← Retour
      </button>

      {/* Infos du voyage */}
      <div className="card">
        <h1>{trip.countryFlag} {trip.title}</h1>
        {trip.destination && <p className="muted">📍 {trip.destination}</p>}
        {trip.startDate && (
          <p className="muted">
            📅 {trip.startDate.slice(0, 10)}
            {trip.endDate ? ` → ${trip.endDate.slice(0, 10)}` : ''}
          </p>
        )}
        {trip.currency && <p className="muted">Devise : {trip.currency} · Langue : {trip.language}</p>}
        {trip.description && <p className="mt-1">{trip.description}</p>}
      </div>

      {/* Header étapes */}
      <div className="row-between mb-2">
        <h2>Étapes ({steps.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Ajouter une étape'}
        </button>
      </div>

      {/* Formulaire nouvelle étape */}
      {showForm && (
        <div className="card">
          <h2 className="mb-2">Nouvelle étape</h2>
          {formError && <p className="error">{formError}</p>}
          <form onSubmit={handleCreateStep}>
            <StepFormFields
              form={form}
              setForm={setForm}
              onCitySelect={handleCitySelect}
              tripStart={tripStart}
              tripEnd={tripEnd}
            />
            <button className="btn btn-primary" type="submit" disabled={creating || !form.city}>
              {creating ? 'Création…' : 'Ajouter'}
            </button>
          </form>
        </div>
      )}

      {/* Liste des étapes */}
      {steps.length === 0 ? (
        <p className="muted">Aucune étape pour ce voyage.</p>
      ) : (
        steps.map((step, i) => (
          <div className="step-item" key={step.id}>
            <div className="step-number">{i + 1}</div>
            <div className="card" style={{ flex: 1, marginBottom: 0 }}>
              {editingId === step.id ? (
                // Formulaire d'édition inline
                <>
                  <h3 className="mb-2">Modifier l&apos;étape</h3>
                  {editError && <p className="error">{editError}</p>}
                  <form onSubmit={(e) => handleUpdateStep(e, step.id)}>
                    <StepFormFields
                      form={editForm}
                      setForm={setEditForm}
                      onCitySelect={handleEditCitySelect}
                      tripStart={tripStart}
                      tripEnd={tripEnd}
                    />
                    <div className="row">
                      <button className="btn btn-primary" type="submit" disabled={saving || !editForm.city}>
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
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
                    <h3>📍 {step.city}</h3>
                    {step.arrivalDate && (
                      <p className="muted">
                        📅 {step.arrivalDate.slice(0, 10)}
                        {step.departureDate ? ` → ${step.departureDate.slice(0, 10)}` : ''}
                      </p>
                    )}
                    {step.notes && <p className="mt-1">{step.notes}</p>}
                    <StepWeather step={step} />
                  </div>
                  <div className="row">
                    <button className="btn btn-secondary" onClick={() => startEdit(step)}>
                      Modifier
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDeleteStep(step.id)}>
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Champs partagés entre création et édition d'une étape
function StepFormFields({ form, setForm, onCitySelect, tripStart, tripEnd }) {
  return (
    <>
      <div className="form-group">
        <label>Ville *</label>
        <CitySearch onSelect={onCitySelect} />
        {form.city && <p className="muted mt-1">✅ {form.city}</p>}
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label>Date d&apos;arrivée *</label>
          <input
            type="date"
            required
            value={form.arrivalDate}
            min={tripStart}
            max={tripEnd}
            onChange={(e) => setForm({ ...form, arrivalDate: e.target.value, departureDate: '' })}
          />
        </div>
        <div className="form-group">
          <label>Date de départ</label>
          <input
            type="date"
            value={form.departureDate}
            min={form.arrivalDate || tripStart}
            max={tripEnd}
            disabled={!form.arrivalDate}
            onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Notes</label>
        <input
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
    </>
  );
}