import { createFileRoute, redirect } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { HR_DEPARTMENT_MODEL, hrDepartmentRecordPath } from '../../lib/hr'

function HrDepartmentForm() {
  const { id } = Route.useParams()
  const recordId = Number(id)
  if (!Number.isFinite(recordId) || recordId <= 0) {
    return <div className="p-6 text-sm text-text-muted">Invalid department id</div>
  }
  return (
    <ModuleRoute
      model={HR_DEPARTMENT_MODEL}
      fallbackView="form"
      recordId={recordId}
      listPath="/hr/departments"
      recordPath={hrDepartmentRecordPath}
    />
  )
}

export const Route = createFileRoute('/hr/department/$id')({
  component: HrDepartmentForm,
  beforeLoad: requireAuth,
  parseParams: ({ id }) => {
    const n = Number(id)
    if (!Number.isFinite(n) || n <= 0) throw redirect({ to: '/hr/departments' })
    return { id: String(n) }
  },
})
