import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { ODOO_ACTION_XML_ID } from '../../lib/odoo-actions'

function InventoryPickings() {
  return <ModuleRoute model="stock.picking" actionXmlId={ODOO_ACTION_XML_ID.stock.pickings} />
}

export const Route = createFileRoute('/inventory/pickings')({
  component: InventoryPickings,
  beforeLoad: requireAuth,
})
