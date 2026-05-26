import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TripDetailPage from './pages/TripDetailPage';
import ProfilePage from './pages/ProfilePage';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

/**
 * Permet de protéger les routes qui nécessitent une authentification. 
 * Si l'utilisateur n'est pas connecté, il est redirigé vers la page de connexion. 
 * Sinon, le composant enfant est rendu normalement.
 * @param {Object} children - Les enfants à rendre si l'utilisateur est authentifié.
 * @return {JSX.Element} Le composant enfant si l'utilisateur est authentifié, sinon une redirection vers la page de connexion.
 */
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

/**
 * Composant principal de l'application qui gère la structure globale.
 * @returns {JSX.Element} Le composant de l'application avec la barre de navigation, les routes et le pied de page.
 */
function AppLayout() {
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {user && <NavBar />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/trips/:id" element={<PrivateRoute><TripDetailPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {user && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}