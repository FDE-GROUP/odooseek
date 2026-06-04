export const CALENDAR_EVENT_MODEL = 'calendar.event'

export const CALENDAR_ACTION_XML_ID = {
  events: 'calendar.action_calendar_event',
} as const

export function calendarEventRecordPath(id: number): string {
  return `/calendar/event/${id}`
}
