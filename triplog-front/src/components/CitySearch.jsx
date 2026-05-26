import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCitySearch } from '../hooks/useCitySearch';
import { usePagination } from '../hooks/usePagination';

/**
 * Composant de recherche de ville avec autocomplétion. Affiche un champ de recherche et une liste déroulante des résultats correspondants. Lorsque l'utilisateur sélectionne une ville, appelle la fonction onSelect avec les données de la ville sélectionnée.
 * @param {Function} onSelect - Fonction à appeler lorsque l'utilisateur sélectionne une ville, avec les données de la ville en argument.
 * @returns {JSX.Element} Le composant CitySearch.
 */
export default function CitySearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const { results, loading, search, clearResults } = useCitySearch();
  const { t } = useTranslation();
  const { paginated, page, totalPages, goTo } = usePagination(results, 5);

  /**
   * Gère le changement de valeur dans le champ de recherche. Lorsque le champ de recherche change, met à jour la query et lance la recherche.
   * @param {Object} e - L'événement de changement.
   */
  function handleChange(e) {
    setQuery(e.target.value);
    search(e.target.value);
    goTo(1);
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
      {paginated.length > 0 && (
        <ul className="city-dropdown">
          {paginated.map((city, i) => (
            <li key={i} className="city-option" onClick={() => handleSelect(city)}>
              <span>{city.nom}</span>
              <span className="muted">{city.pays}</span>
            </li>
          ))}

          {/* Pagination dans le dropdown */}
          {totalPages > 1 && (
            <li className="city-pagination">
              <button
                className="btn btn-secondary"
                onClick={(e) => { e.stopPropagation(); goTo(page - 1); }}
                disabled={page === 1}
              >
                ←
              </button>
              <span className="pagination-info">{page} / {totalPages}</span>
              <button
                className="btn btn-secondary"
                onClick={(e) => { e.stopPropagation(); goTo(page + 1); }}
                disabled={page === totalPages}
              >
                →
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}