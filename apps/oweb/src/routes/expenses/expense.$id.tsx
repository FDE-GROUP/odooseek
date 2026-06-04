import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function ExpenseForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="hr.expense" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/expenses/expense/$id')({
  component: ExpenseForm,
  beforeLoad: requireAuth,
})
