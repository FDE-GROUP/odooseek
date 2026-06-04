import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryInternal() {
  return (
    <ModuleRoute
      model="stock.picking"
      actionXmlId="stock.action_picking_tree_internal"
      listPath="/inventory/internal"
      recordPath={(id) => `/inventory/picking/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/internal')({
  component: InventoryInternal,
  beforeLoad: requireAuth,
})
