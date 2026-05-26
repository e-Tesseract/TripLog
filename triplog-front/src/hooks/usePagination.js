import { useState } from 'react';

/**
 * Hook générique de pagination côté client.

 * @param {Array} items 
 * @param {number} pageSize
 */
export function usePagination(items, pageSize = 5) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / pageSize);
  const start = (page - 1) * pageSize;
  const paginated = items.slice(start, start + pageSize);

  function goTo(p) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  return { paginated, page, totalPages, goTo };
}