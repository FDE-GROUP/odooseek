import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryOrderpointForm() {
  const { id } = Route.useParams()
  return (
    <ModuleRoute model="stock.warehouse.orderpoint" fallbackView="form" recordId={Number(id)} />
  )
}

export const Route = createFileRoute('/inventory/orderpoint/$id')({
  component: InventoryOrderpointForm,
  beforeLoad: requireAuth,
})
