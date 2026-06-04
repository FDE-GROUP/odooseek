import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { EVENT_REGISTRATION_MODEL } from '../../lib/event'

function EventRegistrationForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model={EVENT_REGISTRATION_MODEL} fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/event/registration/$id')({
  component: EventRegistrationForm,
  beforeLoad: requireAuth,
})
