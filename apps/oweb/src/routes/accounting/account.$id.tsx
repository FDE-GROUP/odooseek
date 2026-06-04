import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingAccountForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="account.account" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/accounting/account/$id')({
  component: AccountingAccountForm,
  beforeLoad: requireAuth,
})
