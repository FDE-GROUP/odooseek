import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function CrmLeadForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="crm.lead" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/crm/lead/$id')({
  component: CrmLeadForm,
  beforeLoad: requireAuth,
})
