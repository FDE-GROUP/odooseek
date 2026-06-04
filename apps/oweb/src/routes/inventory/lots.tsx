import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryLots() {
  return (
    <ModuleRoute
      model="stock.lot"
      actionXmlId="stock.action_production_lot_form"
      listPath="/inventory/lots"
      recordPath={(id) => `/inventory/lot/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/lots')({
  component: InventoryLots,
  beforeLoad: requireAuth,
})
