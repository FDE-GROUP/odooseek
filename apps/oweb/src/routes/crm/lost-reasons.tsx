import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function CrmLostReasons() {
  return (
    <ModuleRoute
      model="crm.lost.reason"
      actionXmlId="crm.crm_lost_reason_action"
      listPath="/crm/lost-reasons"
    />
  )
}

export const Route = createFileRoute('/crm/lost-reasons')({
  component: CrmLostReasons,
  beforeLoad: requireAuth,
})
