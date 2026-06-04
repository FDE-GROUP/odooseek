import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { MRP_PRODUCTION_MODEL } from '../../lib/mrp'

function MrpProductionForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model={MRP_PRODUCTION_MODEL} fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/mrp/production/$id')({
  component: MrpProductionForm,
  beforeLoad: requireAuth,
})
