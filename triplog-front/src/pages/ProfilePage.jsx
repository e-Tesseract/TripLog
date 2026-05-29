import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

/**
 * Composant de la page de profil de l'utilisateur qui permet à l'utilisateur de voir et de modifier ses informations personnelles, ainsi que de supprimer son compte. 
 * Affiche un formulaire pré-rempli avec les informations actuelles de l'utilisateur, et gère les mises à jour et la suppression du compte en appelant les endpoints correspondants de l'API.
 */
export default function ProfilePage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Gère la soumission du formulaire de mise à jour du profil.
   * @param {Object} e - L'événement de soumission.
   */
  async function handleUpdate(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const updates = { username: form.username, email: form.email };
      if (form.password) updates.password = form.password;

      const res = await api.put(`/users/${user.id}`, updates);
      login(res.data.user, localStorage.getItem('token'));
      setMessage(t('profile.success'));
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      setError(err.response?.data?.error || t('profile.errorUpdate'));
    } finally {
      setLoading(false);
    }
  }

  /**
   * Gère la suppression du compte de l'utilisateur.
   */
  async function handleDelete() {
    if (!confirm(t('profile.confirmDelete'))) return;
    await api.delete(`/users/${user.id}`);
    logout();
    navigate('/login');
  }

  return (
    <div className="page">
      <h1 className="mb-2">{t('profile.title')}</h1>

      <div className="card">
        <h2 className="mb-2">{t('profile.editTitle')}</h2>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>{t('profile.username')}</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>{t('profile.email')}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>
              {t('profile.newPassword')} <span className="muted">{t('profile.passwordHint')}</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? t('profile.saving') : t('profile.save')}
          </button>
        </form>
      </div>

      <div className="card mt-2">
        <h2 className="mb-1">{t('profile.deleteTitle')}</h2>
        <p className="muted mb-2">{t('profile.deleteWarning')}</p>
        <button className="btn btn-danger" onClick={handleDelete}>
          {t('profile.deleteBtn')}
        </button>
      </div>
    </div>
  );
}