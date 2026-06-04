import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function MrpRoutingForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="mrp.routing.workcenter" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/mrp/routing/$id')({
  component: MrpRoutingForm,
  beforeLoad: requireAuth,
})
