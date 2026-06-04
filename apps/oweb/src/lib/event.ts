export const EVENT_EVENT_MODEL = 'event.event'
export const EVENT_REGISTRATION_MODEL = 'event.registration'

export const EVENT_ACTION_XML_ID = {
  events: 'event.action_event_view',
  registrations: 'event.action_registration',
  registrationDesk: 'event.event_barcode_action_main_view',
} as const

export function eventEventRecordPath(id: number): string {
  return `/event/event/${id}`
}

export function eventRegistrationRecordPath(id: number): string {
  return `/event/registration/${id}`
}

export function eventIcsUrl(eventId: number): string {
  return `/api/event/${eventId}/ics`
}

export function eventTicketUrl(eventId: number, accessHash?: string): string {
  const base = `/event/${eventId}/my_tickets`
  return accessHash ? `${base}?access_token=${accessHash}` : base
}
