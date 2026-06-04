import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryLocationForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="stock.location" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/inventory/location/$id')({
  component: InventoryLocationForm,
  beforeLoad: requireAuth,
})
