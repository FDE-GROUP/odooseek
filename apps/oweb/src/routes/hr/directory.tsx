import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function HrDirectory() {
  return <ModuleRoute model="hr.employee" defaultView="kanban" domain={[['active', '=', true]]} />
}

export const Route = createFileRoute('/hr/directory')({
  component: HrDirectory,
  beforeLoad: requireAuth,
})
