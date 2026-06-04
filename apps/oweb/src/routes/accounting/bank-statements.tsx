import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function AccountingBankStatements() {
  return (
    <ModuleRoute
      model="account.bank.statement"
      actionXmlId="account.action_bank_statement_tree"
      listPath="/accounting/bank-statements"
      recordPath={(id) => `/accounting/bank-statement/${id}`}
    />
  )
}

export const Route = createFileRoute('/accounting/bank-statements')({
  component: AccountingBankStatements,
  beforeLoad: requireAuth,
})
