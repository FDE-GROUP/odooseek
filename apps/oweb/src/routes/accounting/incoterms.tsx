import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function Incoterms() {
  return (
    <ModuleRoute
      model="account.incoterms"
      actionXmlId="account.action_incoterms_tree"
      listPath="/accounting/incoterms"
    />
  )
}

export const Route = createFileRoute('/accounting/incoterms')({
  component: Incoterms,
  beforeLoad: requireAuth,
})
