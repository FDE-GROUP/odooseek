import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingJournalItemForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="account.move.line" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/accounting/journal-item/$id')({
  component: AccountingJournalItemForm,
  beforeLoad: requireAuth,
})
