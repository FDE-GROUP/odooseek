import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryWarehouse() {
  return (
    <ModuleRoute
      model="stock.warehouse"
      actionXmlId="stock.action_warehouse_form"
      listPath="/inventory/warehouse"
      recordPath={(id) => `/inventory/warehouse/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/warehouse')({
  component: InventoryWarehouse,
  beforeLoad: requireAuth,
})
