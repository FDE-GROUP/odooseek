import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingPayments() {
  return (
    <ModuleRoute
      model="account.payment"
      actionXmlId="account.action_account_payments"
      listPath="/accounting/payments"
      recordPath={(id) => `/accounting/payment/${id}`}
    />
  )
}

export const Route = createFileRoute('/accounting/payments')({
  component: AccountingPayments,
  beforeLoad: requireAuth,
})
