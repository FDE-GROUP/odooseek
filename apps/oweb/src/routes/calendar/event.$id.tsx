import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { CALENDAR_EVENT_MODEL } from '../../lib/calendar'

function CalendarEventForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model={CALENDAR_EVENT_MODEL} fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/calendar/event/$id')({
  component: CalendarEventForm,
  beforeLoad: requireAuth,
})
