import { describe, expect, test } from 'vitest'
import {
  EVENT_ACTION_XML_ID,
  EVENT_EVENT_MODEL,
  EVENT_REGISTRATION_MODEL,
  eventEventRecordPath,
  eventIcsUrl,
  eventRegistrationRecordPath,
  eventTicketUrl,
} from '../../../lib/event'
import { resolveMenuRoute } from '../../../lib/menu-navigation'

describe('event routes — menu navigation', () => {
  test('Events main menu → /event/events', () => {
    const target = resolveMenuRoute({
      xmlid: 'event.event_main_menu',
      resModel: false,
    })
    expect(target).toMatchObject({ kind: 'module', to: '/event/events' })
  })

  test('Events submenu → /event/events', () => {
    const target = resolveMenuRoute({
      xmlid: 'event.menu_event_event',
      resModel: false,
    })
    expect(target).toMatchObject({ kind: 'module', to: '/event/events' })
  })

  test('Registration Desk → /event/registration-desk', () => {
    const target = resolveMenuRoute({
      xmlid: 'event.menu_event_registration_desk',
      resModel: false,
    })
    expect(target).toMatchObject({ kind: 'module', to: '/event/registration-desk' })
  })

  test('Attendees menu → /event/registrations', () => {
    const target = resolveMenuRoute({
      xmlid: 'event.menu_action_registration',
      resModel: false,
    })
    expect(target).toMatchObject({ kind: 'module', to: '/event/registrations' })
  })

  test('event.event by resModel → /event/events', () => {
    const target = resolveMenuRoute({
      resModel: EVENT_EVENT_MODEL,
    })
    expect(target).toMatchObject({ kind: 'module', to: '/event/events' })
  })

  test('event.registration by resModel → /event/registrations', () => {
    const target = resolveMenuRoute({
      resModel: EVENT_REGISTRATION_MODEL,
    })
    expect(target).toMatchObject({ kind: 'module', to: '/event/registrations' })
  })

  test('event by actionPath slug → /event/events', () => {
    const target = resolveMenuRoute({
      xmlid: 'event.menu_event_event',
      actionPath: 'events',
    })
    expect(target).toMatchObject({ kind: 'module', to: '/event/events' })
  })
})

describe('event helpers', () => {
  test('eventEventRecordPath returns correct path', () => {
    expect(eventEventRecordPath(42)).toBe('/event/event/42')
  })

  test('eventRegistrationRecordPath returns correct path', () => {
    expect(eventRegistrationRecordPath(99)).toBe('/event/registration/99')
  })

  test('eventIcsUrl returns correct URL', () => {
    expect(eventIcsUrl(10)).toBe('/api/event/10/ics')
  })

  test('eventTicketUrl without hash', () => {
    expect(eventTicketUrl(5)).toBe('/event/5/my_tickets')
  })

  test('eventTicketUrl with access hash', () => {
    expect(eventTicketUrl(5, 'abc123')).toBe('/event/5/my_tickets?access_token=abc123')
  })
})

describe('event action xml ids', () => {
  test('events action', () => {
    expect(EVENT_ACTION_XML_ID.events).toBe('event.action_event_view')
  })

  test('registrations action', () => {
    expect(EVENT_ACTION_XML_ID.registrations).toBe('event.action_registration')
  })

  test('registration desk action', () => {
    expect(EVENT_ACTION_XML_ID.registrationDesk).toBe('event.event_barcode_action_main_view')
  })
})
