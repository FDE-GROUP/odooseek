import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function PaymentTerms() {
  return (
    <ModuleRoute
      model="account.payment.term"
      actionXmlId="account.action_payment_term_form"
      listPath="/accounting/payment-terms"
      recordPath={(id) => `/accounting/payment-term/${id}`}
    />
  )
}

export const Route = createFileRoute('/accounting/payment-terms')({
  component: PaymentTerms,
  beforeLoad: requireAuth,
})
