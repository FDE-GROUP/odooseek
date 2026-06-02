import { createFileRoute, redirect } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { PURCHASE_ORDER_MODEL, purchaseOrderRecordPath } from '../../lib/purchase'

function PurchaseOrderForm() {
  const { id } = Route.useParams()
  const recordId = Number(id)
  if (!Number.isFinite(recordId) || recordId <= 0) {
    return <div className="p-6 text-sm text-text-muted">Invalid order id</div>
  }
  return (
    <ModuleRoute
      model={PURCHASE_ORDER_MODEL}
      fallbackView="form"
      recordId={recordId}
      listPath="/purchase/orders"
      recordPath={purchaseOrderRecordPath}
    />
  )
}

export const Route = createFileRoute('/purchase/order/$id')({
  component: PurchaseOrderForm,
  beforeLoad: requireAuth,
  parseParams: ({ id }) => {
    const n = Number(id)
    if (!Number.isFinite(n) || n <= 0) throw redirect({ to: '/purchase/orders' })
    return { id: String(n) }
  },
})
