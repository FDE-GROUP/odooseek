import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingTaxForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="account.tax" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/accounting/tax/$id')({
  component: AccountingTaxForm,
  beforeLoad: requireAuth,
})
