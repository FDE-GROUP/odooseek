import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { ODOO_ACTION_XML_ID } from '../../lib/odoo-actions'

function CrmPipeline() {
  return (
    <ModuleRoute
      model="crm.lead"
      actionXmlId={ODOO_ACTION_XML_ID.crm.pipeline}
      domain={[['type', '=', 'opportunity']]}
    />
  )
}

export const Route = createFileRoute('/crm/pipeline')({
  component: CrmPipeline,
  beforeLoad: requireAuth,
})
