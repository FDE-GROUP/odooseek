import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryQuants() {
  return (
    <ModuleRoute
      model="stock.quant"
      actionXmlId="stock.action_view_quants"
      listPath="/inventory/quants"
      recordPath={(id) => `/inventory/quant/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/quants')({
  component: InventoryQuants,
  beforeLoad: requireAuth,
})
