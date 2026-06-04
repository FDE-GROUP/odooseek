import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryWaiting() {
  return (
    <ModuleRoute
      model="stock.picking"
      actionXmlId="stock.action_picking_tree_waiting"
      listPath="/inventory/waiting"
      recordPath={(id) => `/inventory/picking/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/waiting')({
  component: InventoryWaiting,
  beforeLoad: requireAuth,
})
