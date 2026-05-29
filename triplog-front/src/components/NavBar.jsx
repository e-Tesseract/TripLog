import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

/**
 * Composant de barre de navigation pour l'application TripLog. 
 * Affiche le nom de l'application, des liens vers le tableau de bord et le profil de l'utilisateur, 
 * ainsi que des boutons pour se déconnecter et changer la langue.
 * @returns {JSX.Element} Le composant NavBar.
 */
export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  /**
   * Gère la déconnexion de l'utilisateur. 
   * Lorsque l'utilisateur clique sur le bouton de déconnexion, 
   * appelle la fonction de déconnexion du contexte d'authentification et redirige vers la page de connexion.
   */
  function handleLogout() {
    logout();
    navigate('/login');
  }

  /**
   * Gère le changement de langue. 
   * Lorsque l'utilisateur clique sur le bouton de changement de langue, 
   * bascule entre le français et l'anglais en utilisant la fonction changeLanguage de i18n. 
   * Le texte du bouton change également pour indiquer la langue actuelle.
   */
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
          <button className="btn btn-secondary navbar-button" onClick={handleLogout}>
            {t('nav.logout')}
          </button>
          <button className="btn btn-secondary navbar-button" onClick={handleToggleLang}>
            {i18n.language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
          </button>
        </div>
      </div>
    </nav>
  );
}