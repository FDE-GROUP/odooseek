import type { OdooFieldMeta, ParsedCalendarView } from '@odooseek/odoo-client'
import type { CalendarEvent } from './OdooCalendarRenderer'

export function getEventAvatarUrl(
  event: CalendarEvent,
  calView: ParsedCalendarView,
  fields: Record<string, OdooFieldMeta>,
): string | null {
  for (const fname of calView.fields) {
    const avatarField = calView.fieldAttrs[fname]?.avatarField
    if (!avatarField) continue

    const val = event.record[fname]
    if (Array.isArray(val) && typeof val[0] === 'number') {
      const relation = fields[fname]?.relation
      if (relation) {
        return `/api/web/image/${relation}/${val[0]}/${avatarField}`
      }
    }
  }

  return null
}
