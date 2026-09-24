import { useCallback, useEffect, useState } from "react";

export interface AsyncOptions {
  /**
   * When set, the last successful value is kept in an in-memory cache under
   * this key. On the next mount with the same key the cached value shows
   * immediately (stale) while a fresh fetch revalidates it in the background,
   * so navigating back to a screen never flashes a spinner.
   */
  cacheKey?: string;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  /** Replace the current (and cached) value locally, without refetching. */
  mutate: (value: T) => void;
}

// Process-wide cache of last successful values, keyed by `cacheKey`. Lives as
// long as the app is mounted; it is a client cache, never persisted.
const cache = new Map<string, unknown>();
const pending = new Map<string, Promise<unknown>>();

/** Drop a cached value so the next mount refetches from scratch. */
export function invalidarCache(cacheKey: string): void {
  cache.delete(cacheKey);
}

/** Clear the whole cache. Mainly for tests, to keep cases isolated. */
export function limpiarCacheAsync(): void {
  cache.clear();
  pending.clear();
}

/**
 * Run an async fetcher on mount (and on demand). Keeps the three states the UI
 * needs — loading, error, data — without pulling in a data-fetching library.
 * With `cacheKey` it also caches the result for instant, stale-while-revalidate
 * navigation between screens.
 */
export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: AsyncOptions = {},
): AsyncState<T> {
  const { cacheKey } = options;
  const inicial = cacheKey ? (cache.get(cacheKey) as T | undefined) : undefined;
  const [data, setData] = useState<T | null>(inicial ?? null);
  const [loading, setLoading] = useState(inicial === undefined);
  const [error, setError] = useState<string | null>(null);

  // When the key changes, swap to whatever is cached for it right away, so a
  // tab/route change shows the last data instead of a blank state.
  useEffect(() => {
    setData(cacheKey ? ((cache.get(cacheKey) as T | undefined) ?? null) : null);
  }, [cacheKey]);

  const run = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    let request: Promise<T>;
    if (!cacheKey) {
      request = fetcher();
    } else {
      const inFlight = pending.get(cacheKey) as Promise<T> | undefined;
      request = inFlight ?? fetcher();
      if (!inFlight) pending.set(cacheKey, request);
    }

    const finishPending = () => {
      if (cacheKey && pending.get(cacheKey) === request) pending.delete(cacheKey);
    };

    request.then(
      (result) => {
        finishPending();
        if (cancelled) return;
        setData(result);
        if (cacheKey) cache.set(cacheKey, result);
        setLoading(false);
      },
      (err: unknown) => {
        finishPending();
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error inesperado");
          setLoading(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, cacheKey]);

  useEffect(run, [run]);

  const mutate = useCallback(
    (value: T) => {
      setData(value);
      if (cacheKey) cache.set(cacheKey, value);
    },
    [cacheKey],
  );

  return { data, loading, error, reload: run, mutate };
}
