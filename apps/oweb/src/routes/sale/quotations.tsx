import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function SaleQuotations() {
  return (
    <ModuleRoute
      model="sale.order"
      actionXmlId="sale.action_quotations_with_onboarding"
      listPath="/sale/quotations"
      recordPath={(id) => `/sale/order/${id}`}
    />
  )
}

export const Route = createFileRoute('/sale/quotations')({
  component: SaleQuotations,
  beforeLoad: requireAuth,
})
