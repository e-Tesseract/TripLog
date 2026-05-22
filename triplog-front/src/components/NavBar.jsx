import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleToggleLang() {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="navbar-brand">✈ TripLog</span>
        <div className="row">
          <Link to="/">{t('nav.dashboard')}</Link>
          <Link to="/profile">{user?.username}</Link>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}>
            {t('nav.logout')}
          </button>
          <button className="btn btn-secondary" onClick={handleToggleLang} style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}>
            {i18n.language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
          </button>
        </div>
      </div>
    </nav>
  );
}