import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingCreditNotes() {
  return (
    <ModuleRoute
      model="account.move"
      actionXmlId="account.action_move_out_refund_type_non_legacy"
      listPath="/accounting/credit-notes"
      recordPath={(id) => `/accounting/move/${id}`}
    />
  )
}

export const Route = createFileRoute('/accounting/credit-notes')({
  component: AccountingCreditNotes,
  beforeLoad: requireAuth,
})
