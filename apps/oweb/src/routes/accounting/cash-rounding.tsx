import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function CashRounding() {
  return (
    <ModuleRoute
      model="account.cash.rounding"
      actionXmlId="account.rounding_list_action"
      listPath="/accounting/cash-rounding"
    />
  )
}

export const Route = createFileRoute('/accounting/cash-rounding')({
  component: CashRounding,
  beforeLoad: requireAuth,
})
