/**
 * Wraps a query function to enforce a fallback result when undefined/null is returned.
 *
 * Usage:
 *   queryFn: safeQuery(() => api.getSomething().then(res => res.data), [])
 */
export function safeQuery(fn, fallback) {
  return async () => {
    const result = await fn();

    if (result === undefined || result === null) {
      return fallback;
    }

    return result;
  };
}
