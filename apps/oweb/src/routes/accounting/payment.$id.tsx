import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingPaymentForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="account.payment" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/accounting/payment/$id')({
  component: AccountingPaymentForm,
  beforeLoad: requireAuth,
})
