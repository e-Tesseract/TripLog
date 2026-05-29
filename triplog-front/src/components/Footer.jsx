/**
 * Composant de pied de page pour l'application TripLog. 
 * Affiche le nom de l'application et l'année en cours.
 * @returns {JSX.Element} Le composant Footer.
 */
export default function Footer() {
  return (
    <footer className="footer">
      TripLog - {new Date().getFullYear()}
    </footer>
  );
}