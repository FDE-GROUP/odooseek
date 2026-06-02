import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function CrmTeams() {
  return (
    <ModuleRoute model="crm.team" listPath="/crm/teams" recordPath={(id) => `/crm/team/${id}`} />
  )
}

export const Route = createFileRoute('/crm/teams')({
  component: CrmTeams,
  beforeLoad: requireAuth,
})
