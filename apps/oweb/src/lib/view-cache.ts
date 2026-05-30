const CACHE_PREFIX = 'oweb_views_'
const COL_PREF_PREFIX = 'oweb_cols_'
const TTL_MS = 60 * 60 * 1000 // 1 hour
const MAX_ENTRIES = 20

interface CachedEntry {
  timestamp: number
  data: unknown
}

export function cacheKey(model: string, views: [number | false, string][]): string {
  return `${model}:${views.map((v) => `${v[0] || 'f'}:${v[1]}`).join(',')}`
}

export function getCachedViews(key: string): unknown | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const entry: CachedEntry = JSON.parse(raw)
    if (Date.now() - entry.timestamp > TTL_MS) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

export function setCachedViews(key: string, data: unknown): void {
  try {
    const entry: CachedEntry = { timestamp: Date.now(), data }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
    evictIfNeeded()
  } catch {
    // localStorage full, ignore
  }
}

export function getColumnPrefs(key: string): string[] | null {
  try {
    const raw = localStorage.getItem(COL_PREF_PREFIX + key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setColumnPrefs(key: string, hidden: string[]): void {
  try {
    localStorage.setItem(COL_PREF_PREFIX + key, JSON.stringify(hidden))
  } catch {
    // ignore
  }
}

function evictIfNeeded(): void {
  const keys: { key: string; ts: number }[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith(CACHE_PREFIX)) {
      try {
        const entry: CachedEntry = JSON.parse(localStorage.getItem(k) || '')
        keys.push({ key: k, ts: entry.timestamp })
      } catch {
        /* skip */
      }
    }
  }
  if (keys.length > MAX_ENTRIES) {
    keys.sort((a, b) => a.ts - b.ts)
    const toRemove = keys.slice(0, keys.length - MAX_ENTRIES)
    for (const { key } of toRemove) localStorage.removeItem(key)
  }
}
