import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingInvoices() {
  return (
    <ModuleRoute
      model="account.move"
      actionXmlId="account.action_move_out_invoice"
      listPath="/accounting/invoices"
      recordPath={(id) => `/accounting/move/${id}`}
    />
  )
}

export const Route = createFileRoute('/accounting/invoices')({
  component: AccountingInvoices,
  beforeLoad: requireAuth,
})
