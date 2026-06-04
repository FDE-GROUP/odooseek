import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function EventStages() {
  return <ModuleRoute model="event.stage" listPath="/event/stages" />
}

export const Route = createFileRoute('/event/stages')({
  component: EventStages,
  beforeLoad: requireAuth,
})
