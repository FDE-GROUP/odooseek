import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function FiscalPositions() {
  return (
    <ModuleRoute
      model="account.fiscal.position"
      actionXmlId="account.action_account_fiscal_position_form"
      listPath="/accounting/fiscal-positions"
      recordPath={(id) => `/accounting/fiscal-position/${id}`}
    />
  )
}

export const Route = createFileRoute('/accounting/fiscal-positions')({
  component: FiscalPositions,
  beforeLoad: requireAuth,
})
