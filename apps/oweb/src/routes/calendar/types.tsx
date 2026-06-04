import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function CalendarTypes() {
  return (
    <ModuleRoute
      model="calendar.event.type"
      actionXmlId="calendar.action_calendar_event_type"
      listPath="/calendar/types"
    />
  )
}

export const Route = createFileRoute('/calendar/types')({
  component: CalendarTypes,
  beforeLoad: requireAuth,
})
