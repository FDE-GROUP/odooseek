import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function HrEmployees() {
  return <ModuleRoute model="hr.employee" defaultView="kanban" />
}

export const Route = createFileRoute('/hr/employees')({
  component: HrEmployees,
  beforeLoad: requireAuth,
})
