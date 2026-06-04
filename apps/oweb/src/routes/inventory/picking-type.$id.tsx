import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function PickingTypeForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="stock.picking.type" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/inventory/picking-type/$id')({
  component: PickingTypeForm,
  beforeLoad: requireAuth,
})
