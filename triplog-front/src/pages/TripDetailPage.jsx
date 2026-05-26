import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { trip, steps, setSteps, loading, error } = useTripDetail(id);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

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
      setFormError(err.response?.data?.message || t('tripDetail.errorCreate'));
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
      setEditError(err.response?.data?.message || t('tripDetail.errorUpdate'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStep(stepId) {
    if (!confirm(t('tripDetail.confirmDelete'))) return;
    await api.delete(`/trips/${id}/steps/${stepId}`);
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
  }

  if (loading) return <div className="page">{t('common.loading')}</div>;
  if (error) return <div className="page"><p className="error">{t(error)}</p></div>;

  const tripStart = trip.startDate ? trip.startDate.slice(0, 10) : undefined;
  const tripEnd = trip.endDate ? trip.endDate.slice(0, 10) : undefined;

  return (
    <div className="page">
      <button className="btn btn-secondary mb-2" onClick={() => navigate('/')}>
        {t('tripDetail.back')}
      </button>

      <div className="card">
        <h1>{trip.countryFlag} {trip.title}</h1>
        {trip.destination && <p className="muted">📍 {trip.destination}</p>}
        {trip.startDate && (
          <p className="muted">
            📅 {trip.startDate.slice(0, 10)}
            {trip.endDate ? ` → ${trip.endDate.slice(0, 10)}` : ''}
          </p>
        )}
        {trip.currency && <p className="muted">💰 {trip.currency} · 🗣️ {trip.language}</p>}
        {trip.description && <p className="mt-1">{trip.description}</p>}
      </div>

      <div className="row-between mb-2">
        <h2>{t('tripDetail.steps')} ({steps.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? t('tripDetail.cancel') : t('tripDetail.addStep')}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="mb-2">{t('tripDetail.newStep')}</h2>
          {formError && <p className="error">{formError}</p>}
          <form onSubmit={handleCreateStep}>
            <StepFormFields
              form={form}
              setForm={setForm}
              onCitySelect={handleCitySelect}
              tripStart={tripStart}
              tripEnd={tripEnd}
              t={t}
            />
            <button className="btn btn-primary" type="submit" disabled={creating || !form.city}>
              {creating ? t('tripDetail.adding') : t('tripDetail.add')}
            </button>
          </form>
        </div>
      )}

      {steps.length === 0 ? (
        <p className="muted">{t('tripDetail.noSteps')}</p>
      ) : (
        steps.map((step, i) => (
          <div className="step-item" key={step.id}>
            <div className="step-number">{i + 1}</div>
            <div className="card" style={{ flex: 1, marginBottom: 0 }}>
              {editingId === step.id ? (
                <>
                  <h3 className="mb-2">{t('tripDetail.editStep')}</h3>
                  {editError && <p className="error">{editError}</p>}
                  <form onSubmit={(e) => handleUpdateStep(e, step.id)}>
                    <StepFormFields
                      form={editForm}
                      setForm={setEditForm}
                      onCitySelect={handleEditCitySelect}
                      tripStart={tripStart}
                      tripEnd={tripEnd}
                      t={t}
                    />
                    <div className="row">
                      <button className="btn btn-primary" type="submit" disabled={saving || !editForm.city}>
                        {saving ? t('tripDetail.saving') : t('tripDetail.save')}
                      </button>
                      <button className="btn btn-secondary" type="button" onClick={cancelEdit}>
                        {t('tripDetail.cancel')}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
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
                      {t('tripDetail.edit')}
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDeleteStep(step.id)}>
                      {t('tripDetail.delete')}
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

function StepFormFields({ form, setForm, onCitySelect, tripStart, tripEnd, t }) {
  return (
    <>
      <div className="form-group">
        <label>{t('tripDetail.city')} *</label>
        <CitySearch onSelect={onCitySelect} />
        {form.city && <p className="muted mt-1">✅ {form.city}</p>}
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label>{t('tripDetail.arrivalDate')} *</label>
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
          <label>{t('tripDetail.departureDate')}</label>
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
        <label>{t('tripDetail.notes')}</label>
        <input
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
    </>
  );
}