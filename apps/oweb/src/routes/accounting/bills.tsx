import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingBills() {
  return (
    <ModuleRoute
      model="account.move"
      actionXmlId="account.action_move_in_invoice"
      listPath="/accounting/bills"
      recordPath={(id) => `/accounting/move/${id}`}
    />
  )
}

export const Route = createFileRoute('/accounting/bills')({
  component: AccountingBills,
  beforeLoad: requireAuth,
})
