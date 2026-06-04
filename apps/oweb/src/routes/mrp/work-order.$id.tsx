import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function MrpWorkOrderForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="mrp.workorder" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/mrp/work-order/$id')({
  component: MrpWorkOrderForm,
  beforeLoad: requireAuth,
})
