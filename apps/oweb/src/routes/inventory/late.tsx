import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryLate() {
  return (
    <ModuleRoute
      model="stock.picking"
      actionXmlId="stock.action_picking_tree_late"
      listPath="/inventory/late"
      recordPath={(id) => `/inventory/picking/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/late')({
  component: InventoryLate,
  beforeLoad: requireAuth,
})
