import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function HrDepartmentForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="hr.department" defaultView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/hr/department/$id')({
  component: HrDepartmentForm,
  beforeLoad: requireAuth,
})
