import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="navbar-brand">✈ TripLog</span>
        <div className="row">
          <Link to="/">Mes voyages</Link>
          <Link to="/profile">{user?.username}</Link>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}>
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
}