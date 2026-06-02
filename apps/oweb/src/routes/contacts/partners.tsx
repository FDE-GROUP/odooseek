import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { ODOO_ACTION_XML_ID } from '../../lib/odoo-actions'

const PARTNER_MODEL = 'res.partner'

function ContactsPartners() {
  return (
    <ModuleRoute
      model={PARTNER_MODEL}
      actionXmlId={ODOO_ACTION_XML_ID.contacts.partners}
      listPath="/contacts/partners"
      recordPath={(id) => `/contacts/partner/${id}`}
    />
  )
}

export const Route = createFileRoute('/contacts/partners')({
  component: ContactsPartners,
  beforeLoad: requireAuth,
})
