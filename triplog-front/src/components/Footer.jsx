import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ProfilePage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault(); 
    setMessage(''); setError('');
    setLoading(true);
    try {
      const updates = { username: form.username, email: form.email };
      if (form.password) updates.password = form.password;
      const res = await api.put(`/users/${user.id}`, updates);
      login(res.data.user, localStorage.getItem('token'));
      setMessage('Profil mis à jour avec succès !');
      setForm(f => ({ ...f, password: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer définitivement votre compte et tous vos voyages ?')) return;
    await api.delete(`/users/${user.id}`);
    logout();
    navigate('/login');
  };

  return (
    <div className="page fade-up">
      <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Mon profil</h1>
      <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Gérez vos informations personnelles
      </p>

      {/* Avatar placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--teal)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', fontFamily: 'Playfair Display, serif', fontWeight: 700,
          boxShadow: 'var(--shadow)',
        }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user?.username}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--ink-light)' }}>{user?.email}</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480, marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Modifier mes informations</h2>

        {message && <div className="success-msg">{message}</div>}
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="label">Nom d'utilisateur</label>
            <input
              className="input-field"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input-field"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="label">Nouveau mot de passe</label>
            <input
              className="input-field"
              type="password"
              placeholder="Laisser vide pour ne pas changer"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Mise à jour…' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ maxWidth: 480, borderTop: '3px solid var(--coral)' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--coral)' }}>Zone dangereuse</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)', marginBottom: '1rem' }}>
          La suppression du compte est définitive et entraîne la perte de tous vos voyages.
        </p>
        <button className="btn-danger" onClick={handleDelete}>
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
}