import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingChartOfAccounts() {
  return (
    <ModuleRoute
      model="account.account"
      actionXmlId="account.action_account_form"
      listPath="/accounting/chart-of-accounts"
      recordPath={(id) => `/accounting/account/${id}`}
    />
  )
}

export const Route = createFileRoute('/accounting/chart-of-accounts')({
  component: AccountingChartOfAccounts,
  beforeLoad: requireAuth,
})
