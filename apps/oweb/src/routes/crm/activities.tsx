import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function CrmActivities() {
  return (
    <ModuleRoute
      model="crm.lead"
      actionXmlId="crm.crm_lead_action_my_activities"
      listPath="/crm/activities"
      recordPath={(id) => `/crm/lead/${id}`}
    />
  )
}

export const Route = createFileRoute('/crm/activities')({
  component: CrmActivities,
  beforeLoad: requireAuth,
})
