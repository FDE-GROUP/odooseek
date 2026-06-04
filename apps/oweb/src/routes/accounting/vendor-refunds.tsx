import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingVendorRefunds() {
  return (
    <ModuleRoute
      model="account.move"
      actionXmlId="account.action_move_in_refund_type"
      listPath="/accounting/vendor-refunds"
      recordPath={(id) => `/accounting/move/${id}`}
    />
  )
}

export const Route = createFileRoute('/accounting/vendor-refunds')({
  component: AccountingVendorRefunds,
  beforeLoad: requireAuth,
})
