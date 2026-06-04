import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingTaxes() {
  return (
    <ModuleRoute
      model="account.tax"
      actionXmlId="account.action_tax_form"
      listPath="/accounting/taxes"
      recordPath={(id) => `/accounting/tax/${id}`}
    />
  )
}

export const Route = createFileRoute('/accounting/taxes')({
  component: AccountingTaxes,
  beforeLoad: requireAuth,
})
