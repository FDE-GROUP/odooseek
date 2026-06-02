import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { ODOO_ACTION_XML_ID } from '../../lib/odoo-actions'

function AccountingMoves() {
  return <ModuleRoute model="account.move" actionXmlId={ODOO_ACTION_XML_ID.account.moves} />
}

export const Route = createFileRoute('/accounting/moves')({
  component: AccountingMoves,
  beforeLoad: requireAuth,
})
