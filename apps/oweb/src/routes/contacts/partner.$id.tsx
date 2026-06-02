import { createFileRoute, redirect } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

const PARTNER_MODEL = 'res.partner'

function ContactPartnerForm() {
  const { id } = Route.useParams()
  const recordId = Number(id)
  if (!Number.isFinite(recordId) || recordId <= 0) {
    return <div className="p-6 text-sm text-text-muted">Invalid contact id</div>
  }
  return (
    <ModuleRoute
      model={PARTNER_MODEL}
      fallbackView="form"
      recordId={recordId}
      listPath="/contacts/partners"
      recordPath={(rid) => `/contacts/partner/${rid}`}
    />
  )
}

export const Route = createFileRoute('/contacts/partner/$id')({
  component: ContactPartnerForm,
  beforeLoad: requireAuth,
  parseParams: ({ id }) => {
    const n = Number(id)
    if (!Number.isFinite(n) || n <= 0) throw redirect({ to: '/contacts/partners' })
    return { id: String(n) }
  },
})
