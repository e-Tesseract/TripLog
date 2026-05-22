import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { trips, setTrips, loading, error } = useTrips();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

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
      setCreateError(err.response?.data?.message || t('dashboard.errorCreate'));
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
      setTrips(trips.map((trip) => (trip.id === id ? res.data.trip : trip)));
      cancelEdit();
    } catch (err) {
      setEditError(err.response?.data?.message || t('dashboard.errorUpdate'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm(t('dashboard.confirmDelete'))) return;
    await api.delete(`/trips/${id}`);
    setTrips(trips.filter((trip) => trip.id !== id));
  }

  if (loading) return <div className="page">{t('common.loading')}</div>;
  if (error) return <div className="page"><p className="error">{error}</p></div>;

  return (
    <div className="page">
      <div className="row-between mb-2">
        <h1>{t('dashboard.title')}</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? t('dashboard.cancel') : t('dashboard.newTrip')}
        </button>
      </div>

      {showCreateForm && (
        <div className="card">
          <h2 className="mb-2">{t('dashboard.newTrip')}</h2>
          {createError && <p className="error">{createError}</p>}
          <form onSubmit={handleCreate}>
            <TripFormFields form={createForm} setForm={setCreateForm} t={t} />
            <button className="btn btn-primary" type="submit" disabled={creating}>
              {creating ? t('dashboard.creating') : t('dashboard.create')}
            </button>
          </form>
        </div>
      )}

      {trips.length === 0 ? (
        <p className="muted">{t('dashboard.noTrips')}</p>
      ) : (
        trips.map((trip) => (
          <div className="card" key={trip.id}>
            {editingId === trip.id ? (
              <>
                <h2 className="mb-2">{t('dashboard.editTrip')}</h2>
                {editError && <p className="error">{editError}</p>}
                <form onSubmit={(e) => handleUpdate(e, trip.id)}>
                  <TripFormFields form={editForm} setForm={setEditForm} t={t} />
                  <div className="row">
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                      {saving ? t('dashboard.saving') : t('dashboard.save')}
                    </button>
                    <button className="btn btn-secondary" type="button" onClick={cancelEdit}>
                      {t('dashboard.cancel')}
                    </button>
                  </div>
                </form>
              </>
            ) : (
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
                    {t('tripCard.see')}
                  </button>
                  <button className="btn btn-secondary" onClick={() => startEdit(trip)}>
                    {t('dashboard.edit')}
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(trip.id)}>
                    {t('tripCard.delete')}
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

function TripFormFields({ form, setForm, t }) {
  return (
    <>
      <div className="form-group">
        <label>{t('dashboard.titleLabel')} *</label>
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>{t('dashboard.destination')}</label>
        <input
          value={form.destination}
          onChange={(e) => setForm({ ...form, destination: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>{t('dashboard.description')}</label>
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label>{t('dashboard.startDate')}</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value, endDate: '' })}
          />
        </div>
        <div className="form-group">
          <label>{t('dashboard.endDate')}</label>
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