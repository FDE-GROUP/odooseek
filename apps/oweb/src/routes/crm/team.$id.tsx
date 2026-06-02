import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function CrmTeamForm() {
  const { id } = Route.useParams()
  const recordId = Number(id)
  if (!Number.isFinite(recordId) || recordId <= 0) {
    return <div className="p-6 text-sm text-text-muted">Invalid team id</div>
  }
  return (
    <ModuleRoute model="crm.team" fallbackView="form" recordId={recordId} listPath="/crm/teams" />
  )
}

export const Route = createFileRoute('/crm/team/$id')({
  component: CrmTeamForm,
  beforeLoad: requireAuth,
})
