import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCitySearch } from '../hooks/useCitySearch';

export default function CitySearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const { results, loading, search, clearResults } = useCitySearch();
  const { t } = useTranslation();

  function handleChange(e) {
    setQuery(e.target.value);
    search(e.target.value);
  }

  function handleSelect(city) {
    setQuery(city.nom);
    clearResults();
    onSelect(city);
  }

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