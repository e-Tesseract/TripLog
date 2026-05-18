import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/users/login', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion. Vérifiez que le serveur est démarré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, var(--sand) 60%, var(--sand-dark) 100%)',
      minHeight: '100vh',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="fade-up">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✈️</div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--ink)', marginBottom: '0.4rem' }}>
            Bon retour
          </h1>
          <p style={{ color: 'var(--ink-light)', fontSize: '0.95rem' }}>
            Connectez-vous pour retrouver vos voyages
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Email</label>
              <input
                className="input-field"
                type="email"
                placeholder="vous@exemple.com"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="label">Mot de passe</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--ink-light)' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: 'var(--teal)', fontWeight: 500 }}>
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}