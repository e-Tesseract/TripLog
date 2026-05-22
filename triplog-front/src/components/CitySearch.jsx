import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCitySearch } from '../hooks/useCitySearch';

/**
 * Composant de recherche de ville avec autocomplétion.
 * Utilise l'API de recherche de villes.
 * Affiche une liste déroulante de résultats au fur et à mesure de la saisie.
 * Lorsqu'une ville est sélectionnée, appelle onSelect avec les données de la ville.
 */
export default function CitySearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const { results, loading, search, clearResults } = useCitySearch();
  const { t } = useTranslation();

  /**
   * Gère le changement de valeur dans le champ de recherche. Lorsque le champ de recherche change, met à jour la query et lance la recherche.
   * @param {Object} e - L'événement de changement.
   */
  function handleChange(e) {
    setQuery(e.target.value);
    search(e.target.value);
  }

  /**
   * Gère la sélection d'une ville dans la liste déroulante.
   * @param {Object} city - Les données de la ville sélectionnée.
   */
  function handleSelect(city) {
    setQuery(city.nom);
    clearResults();
    onSelect(city);
  }

  // Affiche le champ de recherche et la liste déroulante des résultats.
  return (
    <div className="city-wrapper">
      <input
        type="text"
        placeholder={t('citySearch.placeholder')}
        value={query}
        onChange={handleChange}
      />
      {loading && <p className="muted mt-1">{t('citySearch.searching')}</p>}
      {results.length > 0 && (
        <ul className="city-dropdown">
          {results.map((city, i) => (
            <li key={i} className="city-option" onClick={() => handleSelect(city)}>
              <span>{city.nom}</span>
              <span className="muted">{city.pays}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}