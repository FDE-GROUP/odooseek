import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function SaleToUpsell() {
  return (
    <ModuleRoute
      model="sale.order"
      actionXmlId="sale.action_orders_upselling"
      listPath="/sale/to-upsell"
      recordPath={(id) => `/sale/order/${id}`}
    />
  )
}

export const Route = createFileRoute('/sale/to-upsell')({
  component: SaleToUpsell,
  beforeLoad: requireAuth,
})
