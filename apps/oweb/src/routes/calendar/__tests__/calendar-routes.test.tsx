import { describe, expect, test } from 'vitest'
import {
  CALENDAR_ACTION_XML_ID,
  CALENDAR_EVENT_MODEL,
  calendarEventRecordPath,
} from '../../../lib/calendar'
import { resolveMenuRoute } from '../../../lib/menu-navigation'

describe('calendar routes — menu navigation', () => {
  test('Calendar main menu → /calendar/events', () => {
    const target = resolveMenuRoute({
      xmlid: 'calendar.mail_menu_calendar',
      resModel: false,
    })
    expect(target).toMatchObject({ kind: 'module', to: '/calendar/events' })
  })

  test('calendar.event by resModel → /calendar/events', () => {
    const target = resolveMenuRoute({
      resModel: CALENDAR_EVENT_MODEL,
    })
    expect(target).toMatchObject({ kind: 'module', to: '/calendar/events' })
  })
})

describe('calendar helpers', () => {
  test('calendarEventRecordPath returns correct path', () => {
    expect(calendarEventRecordPath(42)).toBe('/calendar/event/42')
  })
})

describe('calendar action xml ids', () => {
  test('events action', () => {
    expect(CALENDAR_ACTION_XML_ID.events).toBe('calendar.action_calendar_event')
  })
})
