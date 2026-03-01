const CACHE_KEY = 'subzo-query-cache';
const DEBOUNCE_MS = 2000;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

interface CacheEntry {
  queryKey: readonly unknown[];
  data: unknown;
  updatedAt: number;
}

export function persistCache(queryClient: import('@tanstack/react-query').QueryClient) {
  const cache = queryClient.getQueryCache();

  // Hydrate from localStorage on startup
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const entries: CacheEntry[] = JSON.parse(stored);
      for (const entry of entries) {
        queryClient.setQueryData(entry.queryKey, entry.data, {
          updatedAt: entry.updatedAt,
        });
      }
    }
  } catch {
    // Corrupt cache — ignore
  }

  // Subscribe to cache changes and debounce writes
  cache.subscribe(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      try {
        const queries = cache.getAll();
        const entries: CacheEntry[] = queries
          .filter((q) => q.state.status === 'success' && q.state.data !== undefined)
          .map((q) => ({
            queryKey: q.queryKey,
            data: q.state.data,
            updatedAt: q.state.dataUpdatedAt,
          }));
        localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
      } catch {
        // Storage full or serialization error — skip
      }
    }, DEBOUNCE_MS);
  });
}
