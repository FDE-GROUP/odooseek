import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function MrpWorkCenterForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="mrp.workcenter" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/mrp/work-center/$id')({
  component: MrpWorkCenterForm,
  beforeLoad: requireAuth,
})
