import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      background: 'var(--ink)',
      color: 'var(--sand)',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 16px rgba(26,26,46,0.25)',
    }}>
      <nav style={{
        maxWidth: 900,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        height: 64,
        gap: '2rem',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span style={{ fontSize: '1.4rem' }}>✈️</span>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: 'var(--sand)',
            letterSpacing: '0.02em',
          }}>TripLog</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '0.25rem', flex: 1 }}>
          <NavLink to="/" active={isActive('/')}>Mes voyages</NavLink>
          <NavLink to="/profile" active={isActive('/profile')}>Profil</NavLink>
        </div>

        {/* User + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#aaa', letterSpacing: '0.02em' }}>
            {user?.username}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--sand)',
              padding: '0.4rem 0.9rem',
              borderRadius: 6,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.16)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
          >
            Déconnexion
          </button>
        </div>
      </nav>
    </header>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} style={{
      padding: '0.4rem 0.9rem',
      borderRadius: 6,
      fontSize: '0.9rem',
      fontWeight: active ? 500 : 400,
      color: active ? 'var(--white)' : 'rgba(245,240,232,0.6)',
      background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
      transition: 'all 0.15s',
    }}>
      {children}
    </Link>
  );
}