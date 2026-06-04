import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryOrderpoints() {
  return (
    <ModuleRoute
      model="stock.warehouse.orderpoint"
      actionXmlId="stock.action_orderpoint"
      listPath="/inventory/orderpoints"
      recordPath={(id) => `/inventory/orderpoint/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/orderpoints')({
  component: InventoryOrderpoints,
  beforeLoad: requireAuth,
})
