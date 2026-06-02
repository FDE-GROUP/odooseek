import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { ODOO_ACTION_XML_ID } from '../../lib/odoo-actions'

function CrmLeads() {
  return (
    <ModuleRoute
      model="crm.lead"
      actionXmlId={ODOO_ACTION_XML_ID.crm.leads}
      domain={[['type', '=', 'lead']]}
    />
  )
}

export const Route = createFileRoute('/crm/leads')({
  component: CrmLeads,
  beforeLoad: requireAuth,
})
