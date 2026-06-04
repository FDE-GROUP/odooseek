import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function MrpUnbuildForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="mrp.unbuild" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/mrp/unbuild/$id')({
  component: MrpUnbuildForm,
  beforeLoad: requireAuth,
})
