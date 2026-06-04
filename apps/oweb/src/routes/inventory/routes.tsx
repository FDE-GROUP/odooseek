import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryRoutes() {
  return <ModuleRoute model="stock.route" listPath="/inventory/routes" />
}

export const Route = createFileRoute('/inventory/routes')({
  component: InventoryRoutes,
  beforeLoad: requireAuth,
})
