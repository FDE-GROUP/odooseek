import type { ViewType } from '@odooseek/odoo-client'
import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import {
  CALENDAR_ACTION_XML_ID,
  CALENDAR_EVENT_MODEL,
  calendarEventRecordPath,
} from '../../lib/calendar'

function CalendarEvents() {
  return (
    <ModuleRoute
      model={CALENDAR_EVENT_MODEL}
      actionXmlId={CALENDAR_ACTION_XML_ID.events}
      listPath="/calendar/events"
      recordPath={calendarEventRecordPath}
      availableViews={['calendar', 'list', 'form'] as ViewType[]}
    />
  )
}

export const Route = createFileRoute('/calendar/events')({
  component: CalendarEvents,
  beforeLoad: requireAuth,
})
