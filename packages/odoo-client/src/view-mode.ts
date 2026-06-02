import type { ViewType } from './types'

const SUPPORTED_VIEW_TYPES: ViewType[] = [
  'list',
  'form',
  'kanban',
  'pivot',
  'graph',
  'calendar',
  'activity',
]

/** Map Odoo view mode tokens to frontend ViewType (`tree` → `list`). */
export function normalizeViewMode(raw: string): ViewType | undefined {
  const token = raw.trim().toLowerCase()
  if (token === 'tree') return 'list'
  return SUPPORTED_VIEW_TYPES.includes(token as ViewType) ? (token as ViewType) : undefined
}

/** Parse act_window `view_mode` string (comma-separated). */
export function parseActionViewModes(viewMode?: string): ViewType[] {
  if (!viewMode) return []
  return viewMode
    .split(',')
    .map((part) => normalizeViewMode(part))
    .filter((v): v is ViewType => v != null)
}

/** Prefer `views` tuple order; fall back to `view_mode` string. */
export function orderedViewTypesFromActWindow(viewMode?: string, views?: unknown): ViewType[] {
  if (Array.isArray(views) && views.length > 0) {
    const fromViews = views
      .map((entry) => {
        if (!Array.isArray(entry) || entry.length < 2) return undefined
        return normalizeViewMode(String(entry[1]))
      })
      .filter((v): v is ViewType => v != null)
    if (fromViews.length > 0) return fromViews
  }
  return parseActionViewModes(viewMode)
}

/** First view in action order (Odoo opens the first mode in `view_mode` / `views`). */
export function defaultViewTypeFromActWindow(viewMode?: string, views?: unknown): ViewType {
  return orderedViewTypesFromActWindow(viewMode, views)[0] ?? 'list'
}
