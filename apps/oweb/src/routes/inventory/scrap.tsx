import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryScrap() {
  return (
    <ModuleRoute
      model="stock.scrap"
      actionXmlId="stock.action_stock_scrap"
      listPath="/inventory/scrap"
      recordPath={(id) => `/inventory/scrap/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/scrap')({
  component: InventoryScrap,
  beforeLoad: requireAuth,
})
