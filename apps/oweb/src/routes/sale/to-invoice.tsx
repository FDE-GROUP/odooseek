import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function SaleToInvoice() {
  return (
    <ModuleRoute
      model="sale.order"
      actionXmlId="sale.action_orders_to_invoice"
      listPath="/sale/to-invoice"
      recordPath={(id) => `/sale/order/${id}`}
    />
  )
}

export const Route = createFileRoute('/sale/to-invoice')({
  component: SaleToInvoice,
  beforeLoad: requireAuth,
})
