const RECENT_SEARCHES_KEY = "achromatic-recent-searches";
const MAX_RECENT_SEARCHES = 6;

function normalizeQuery(query: string) {
  return query.trim().replace(/\s+/g, " ").slice(0, 120);
}

export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]"
    );

    if (!Array.isArray(value)) return [];

    return value
      .filter((item): item is string => typeof item === "string")
      .map(normalizeQuery)
      .filter(Boolean)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string): string[] {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery || typeof window === "undefined") {
    return readRecentSearches();
  }

  const nextSearches = [
    normalizedQuery,
    ...readRecentSearches().filter(
      (item) => item.toLocaleLowerCase("vi") !== normalizedQuery.toLocaleLowerCase("vi")
    ),
  ].slice(0, MAX_RECENT_SEARCHES);

  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextSearches));
  } catch {
    // localStorage may be unavailable in privacy mode; search should still work.
  }

  return nextSearches;
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore storage errors because this is a non-critical convenience feature.
  }
}
