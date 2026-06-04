import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryPackageForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="stock.package" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/inventory/package/$id')({
  component: InventoryPackageForm,
  beforeLoad: requireAuth,
})
