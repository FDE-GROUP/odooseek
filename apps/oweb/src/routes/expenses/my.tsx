import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function ExpenseMy() {
  return (
    <ModuleRoute
      model="hr.expense"
      actionXmlId="hr_expense.action_hr_expense_my_expenses_all"
      listPath="/expenses/my"
      recordPath={(id) => `/expenses/expense/${id}`}
    />
  )
}

export const Route = createFileRoute('/expenses/my')({
  component: ExpenseMy,
  beforeLoad: requireAuth,
})
