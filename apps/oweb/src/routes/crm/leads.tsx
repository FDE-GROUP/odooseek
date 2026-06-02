import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { ODOO_ACTION_XML_ID } from '../../lib/odoo-actions'

function crmLeadRecordPath(id: number): string {
  return `/crm/lead/${id}`
}

function CrmLeads() {
  return (
    <ModuleRoute
      model="crm.lead"
      actionXmlId={ODOO_ACTION_XML_ID.crm.leads}
      domain={[['type', '=', 'lead']]}
      listPath="/crm/leads"
      recordPath={crmLeadRecordPath}
    />
  )
}

export const Route = createFileRoute('/crm/leads')({
  component: CrmLeads,
  beforeLoad: requireAuth,
})
