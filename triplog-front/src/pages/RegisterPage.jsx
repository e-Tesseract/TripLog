import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

/**
 * Composant de la page d'inscription qui affiche un formulaire pour que l'utilisateur puisse créer un nouveau compte en entrant un nom d'utilisateur, une adresse e-mail et un mot de passe. 
 * @return {JSX.Element} Le composant de la page d'inscription avec le formulaire et les messages d'erreur.
 */
export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Gère la soumission du formulaire d'inscription.
   * @param {Object} e - L'événement de soumission.
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/users/register', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || t('register.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="mb-2">{t('register.title')}</h1>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('register.username')}</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>{t('register.email')}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>{t('register.password')}</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? t('register.submitting') : t('register.submit')}
          </button>
        </form>

        <p className="muted mt-2">
          {t('register.alreadyAccount')} <Link to="/login">{t('register.login')}</Link>
        </p>
      </div>
    </div>
  );
}