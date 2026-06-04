import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryOverview() {
  return (
    <ModuleRoute
      model="stock.picking.type"
      actionXmlId="stock.stock_picking_type_action"
      listPath="/inventory/overview"
      recordPath={(id) => `/inventory/picking-type/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/overview')({
  component: InventoryOverview,
  beforeLoad: requireAuth,
})
