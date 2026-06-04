import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingBankStatementForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="account.bank.statement" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/accounting/bank-statement/$id')({
  component: AccountingBankStatementForm,
  beforeLoad: requireAuth,
})
