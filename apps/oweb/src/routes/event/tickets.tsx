import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function EventTickets() {
  return <ModuleRoute model="event.event.ticket" listPath="/event/tickets" />
}

export const Route = createFileRoute('/event/tickets')({
  component: EventTickets,
  beforeLoad: requireAuth,
})
