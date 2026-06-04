import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function EventTypes() {
  return <ModuleRoute model="event.type" listPath="/event/types" />
}

export const Route = createFileRoute('/event/types')({
  component: EventTypes,
  beforeLoad: requireAuth,
})
