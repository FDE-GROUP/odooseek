import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryBackorder() {
  return (
    <ModuleRoute
      model="stock.picking"
      actionXmlId="stock.action_picking_tree_backorder"
      listPath="/inventory/backorder"
      recordPath={(id) => `/inventory/picking/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/backorder')({
  component: InventoryBackorder,
  beforeLoad: requireAuth,
})
