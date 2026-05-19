import { useState, useRef } from 'react';
import api from '../api/axios';

export function useCitySearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  function search(query) {
    clearTimeout(timeoutRef.current);
    if (query.length < 2) { setResults([]); return; }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/cities/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function clearResults() {
    setResults([]);
  }

  return { results, loading, search, clearResults };
}