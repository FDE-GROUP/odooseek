import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function ExpenseSheetForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="hr.expense.sheet" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/expenses/sheet/$id')({
  component: ExpenseSheetForm,
  beforeLoad: requireAuth,
})
