import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { EVENT_EVENT_MODEL } from '../../lib/event'

function EventForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model={EVENT_EVENT_MODEL} fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/event/event/$id')({
  component: EventForm,
  beforeLoad: requireAuth,
})
