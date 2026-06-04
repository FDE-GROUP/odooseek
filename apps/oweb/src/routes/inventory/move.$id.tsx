import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryMoveForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="stock.move" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/inventory/move/$id')({
  component: InventoryMoveForm,
  beforeLoad: requireAuth,
})
