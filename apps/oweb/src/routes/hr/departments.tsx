import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function HrDepartments() {
  return <ModuleRoute model="hr.department" defaultView="kanban" />
}

export const Route = createFileRoute('/hr/departments')({
  component: HrDepartments,
  beforeLoad: requireAuth,
})
