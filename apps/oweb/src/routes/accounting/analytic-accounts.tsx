import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AnalyticAccounts() {
  return (
    <ModuleRoute
      model="account.analytic.account"
      actionXmlId="analytic.account_analytic_account_action"
      listPath="/accounting/analytic-accounts"
      recordPath={(id) => `/accounting/analytic-account/${id}`}
    />
  )
}

export const Route = createFileRoute('/accounting/analytic-accounts')({
  component: AnalyticAccounts,
  beforeLoad: requireAuth,
})
