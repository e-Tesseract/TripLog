import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

/**
 * Composant de la page de connexion qui affiche un formulaire pour que
 * l'utilisateur puisse entrer son adresse e-mail et son mot de passe.
 * @return {JSX.Element} Le composant de la page de connexion.
 */
export default function LoginPage() {
  const { login, loading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('session') === 'expired';

  const [form, setForm] = useState({ email: '', password: '' });

  /**
   * Gère la soumission du formulaire de connexion.
   * Délègue l'appel API au contexte AuthContext.
   * @param {Object} e - L'événement de soumission.
   */
  async function handleSubmit(e) {
    e.preventDefault();
    await login(form);
    if (!authError) {
      navigate('/');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="mb-2">{t('login.title')}</h1>

        {sessionExpired && (
          <p className="error">{t('login.sessionExpired')}</p>
        )}

        {authError && <p className="error">{authError}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('login.email')}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>{t('login.password')}</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={authLoading}>
            {authLoading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>

        <p className="muted mt-2">
          {t('login.noAccount')} <Link to="/register">{t('login.register')}</Link>
        </p>
      </div>
    </div>
  );
}
