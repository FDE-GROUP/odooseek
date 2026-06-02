import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingMoveForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="account.move" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/accounting/move/$id')({
  component: AccountingMoveForm,
  beforeLoad: requireAuth,
})
