import { createFileRoute, redirect } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { HR_EMPLOYEE_MODEL, HR_EMPLOYEES_SEARCH_DEFAULT, hrEmployeeRecordPath } from '../../lib/hr'

function HrEmployeeForm() {
  const { id } = Route.useParams()
  const recordId = Number(id)
  if (!Number.isFinite(recordId) || recordId <= 0) {
    return <div className="p-6 text-sm text-text-muted">Invalid employee id</div>
  }
  return (
    <ModuleRoute
      model={HR_EMPLOYEE_MODEL}
      fallbackView="form"
      recordId={recordId}
      listPath="/hr/employees"
      recordPath={hrEmployeeRecordPath}
    />
  )
}

export const Route = createFileRoute('/hr/employee/$id')({
  component: HrEmployeeForm,
  beforeLoad: requireAuth,
  parseParams: ({ id }) => {
    const n = Number(id)
    if (!Number.isFinite(n) || n <= 0)
      throw redirect({ to: '/hr/employees', search: HR_EMPLOYEES_SEARCH_DEFAULT })
    return { id: String(n) }
  },
})
