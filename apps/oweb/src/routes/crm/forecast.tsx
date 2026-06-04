import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function CrmForecast() {
  return (
    <ModuleRoute
      model="crm.lead"
      actionXmlId="crm.crm_lead_action_forecast"
      listPath="/crm/forecast"
      recordPath={(id) => `/crm/lead/${id}`}
    />
  )
}

export const Route = createFileRoute('/crm/forecast')({
  component: CrmForecast,
  beforeLoad: requireAuth,
})
