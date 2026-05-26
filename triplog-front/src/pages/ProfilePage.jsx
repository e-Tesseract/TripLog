import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

/**
 * Composant de la page de profil de l'utilisateur qui permet à l'utilisateur de voir et de modifier ses informations personnelles, ainsi que de supprimer son compte. 
 * Affiche un formulaire pré-rempli avec les informations actuelles de l'utilisateur, et gère les mises à jour et la suppression du compte en appelant les endpoints correspondants de l'API.
 */
export default function ProfilePage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

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
      setMessage('Profil mis à jour !');
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Gère la suppression du compte de l'utilisateur.
   */
  async function handleDelete() {
    if (!confirm('Supprimer définitivement votre compte ?')) return;
    await api.delete(`/users/${user.id}`);
    logout();
    navigate('/login');
  }

  return (
    <div className="page">
      <h1 className="mb-2">Mon profil</h1>

      <div className="card">
        <h2 className="mb-2">Modifier mes informations</h2>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Nom d&apos;utilisateur</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Nouveau mot de passe <span className="muted">(laisser vide pour ne pas changer)</span></label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Mise à jour…' : 'Enregistrer'}
          </button>
        </form>
      </div>

      <div className="card mt-2">
        <h2 className="mb-1">Supprimer mon compte</h2>
        <p className="muted mb-2">Cette action est irréversible et supprime tous vos voyages.</p>
        <button className="btn btn-danger" onClick={handleDelete}>
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
}