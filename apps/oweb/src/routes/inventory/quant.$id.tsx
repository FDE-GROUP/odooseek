import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryQuantForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="stock.quant" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/inventory/quant/$id')({
  component: InventoryQuantForm,
  beforeLoad: requireAuth,
})
