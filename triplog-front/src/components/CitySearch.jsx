import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

export default function CitySearch({ onSelect, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timeoutRef.current);
    if (val.length < 2) { setResults([]); setOpen(false); return; }
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/cities/search?q=${encodeURIComponent(val)}`);
        setResults(res.data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (city) => {
    onSelect(city);
    setQuery(city.nom);
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          className="input-field"
          placeholder="Rechercher une ville…"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          style={{ paddingLeft: '2.5rem' }}
        />
        <span style={{
          position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)',
          fontSize: '1rem', pointerEvents: 'none', opacity: 0.5
        }}>🔍</span>
        {loading && (
          <span style={{
            position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)',
            fontSize: '0.75rem', color: 'var(--teal)'
          }}>···</span>
        )}
      </div>

      {open && results.length > 0 && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--white)', border: '1.5px solid var(--sand-dark)',
          borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-lg)',
          listStyle: 'none', zIndex: 50, overflow: 'hidden',
          maxHeight: 220, overflowY: 'auto',
        }}>
          {results.map((city, i) => (
            <li
              key={i}
              onClick={() => handleSelect(city)}
              style={{
                padding: '0.65rem 1rem',
                cursor: 'pointer',
                borderBottom: i < results.length - 1 ? '1px solid var(--sand-dark)' : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '0.9rem',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--sand)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontWeight: 500 }}>{city.nom}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-light)' }}>{city.pays}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}