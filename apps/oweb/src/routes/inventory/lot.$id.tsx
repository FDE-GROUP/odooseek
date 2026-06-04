import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryLotForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="stock.lot" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/inventory/lot/$id')({
  component: InventoryLotForm,
  beforeLoad: requireAuth,
})
