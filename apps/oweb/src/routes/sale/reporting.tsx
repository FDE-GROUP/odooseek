import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function SaleReporting() {
  return (
    <ModuleRoute
      model="sale.report"
      actionXmlId="sale.action_order_report_all"
      listPath="/sale/reporting"
    />
  )
}

export const Route = createFileRoute('/sale/reporting')({
  component: SaleReporting,
  beforeLoad: requireAuth,
})
