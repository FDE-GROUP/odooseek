import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingDashboard() {
  return (
    <ModuleRoute
      model="account.journal"
      actionXmlId="account.open_account_journal_dashboard_kanban"
      listPath="/accounting/dashboard"
      availableViews={['kanban']}
    />
  )
}

export const Route = createFileRoute('/accounting/dashboard')({
  component: AccountingDashboard,
  beforeLoad: requireAuth,
})
