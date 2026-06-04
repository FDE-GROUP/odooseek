import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function PurchaseVendors() {
  return (
    <ModuleRoute
      model="res.partner"
      actionXmlId="account.res_partner_action_supplier"
      listPath="/purchase/vendors"
      recordPath={(id) => `/contacts/partner/${id}`}
    />
  )
}

export const Route = createFileRoute('/purchase/vendors')({
  component: PurchaseVendors,
  beforeLoad: requireAuth,
})
