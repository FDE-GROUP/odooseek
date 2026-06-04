import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function CrmStages() {
  return <ModuleRoute model="crm.stage" actionXmlId="crm.crm_stage_action" listPath="/crm/stages" />
}

export const Route = createFileRoute('/crm/stages')({
  component: CrmStages,
  beforeLoad: requireAuth,
})
