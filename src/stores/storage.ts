/**
 * Reads and parses a JSON value from `localStorage`.
 * Returns `null` when the key is missing, the JSON is broken or storage is unavailable
 * (private mode, blocked site data), so callers can always fall back to a fresh state.
 */
export const readStorage = (key: string): unknown => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
};

/** Writes a value to `localStorage` as JSON; failures (quota, blocked storage) are ignored. */
export const writeStorage = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is best-effort: the game keeps working in memory.
  }
};
