import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryMoveLineForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="stock.move.line" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/inventory/move-line/$id')({
  component: InventoryMoveLineForm,
  beforeLoad: requireAuth,
})
