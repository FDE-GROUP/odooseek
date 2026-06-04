import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryAdjustment() {
  return (
    <ModuleRoute
      model="stock.quant"
      actionXmlId="stock.action_view_inventory_tree"
      listPath="/inventory/inventory-adjustment"
      recordPath={(id) => `/inventory/quant/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/inventory-adjustment')({
  component: InventoryAdjustment,
  beforeLoad: requireAuth,
})
