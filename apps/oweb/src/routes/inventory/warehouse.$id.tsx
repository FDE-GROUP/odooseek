import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryWarehouseForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="stock.warehouse" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/inventory/warehouse/$id')({
  component: InventoryWarehouseForm,
  beforeLoad: requireAuth,
})
