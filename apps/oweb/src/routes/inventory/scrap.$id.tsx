import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryScrapForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="stock.scrap" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/inventory/scrap/$id')({
  component: InventoryScrapForm,
  beforeLoad: requireAuth,
})
