import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function HrEmployeeForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="hr.employee" defaultView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/hr/employee/$id')({
  component: HrEmployeeForm,
  beforeLoad: requireAuth,
})
