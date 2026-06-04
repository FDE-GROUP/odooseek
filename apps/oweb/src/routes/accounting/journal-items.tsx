import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingJournalItems() {
  return (
    <ModuleRoute
      model="account.move.line"
      actionXmlId="account.action_account_moves_all"
      listPath="/accounting/journal-items"
      recordPath={(id) => `/accounting/journal-item/${id}`}
    />
  )
}

export const Route = createFileRoute('/accounting/journal-items')({
  component: AccountingJournalItems,
  beforeLoad: requireAuth,
})
