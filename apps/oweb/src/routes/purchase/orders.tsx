import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import {
  PURCHASE_ACTION_XML_ID,
  PURCHASE_ORDER_MODEL,
  PURCHASE_PO_DOMAIN,
  purchaseOrderRecordPath,
} from '../../lib/purchase'

function PurchaseOrders() {
  return (
    <ModuleRoute
      model={PURCHASE_ORDER_MODEL}
      actionXmlId={PURCHASE_ACTION_XML_ID.orders}
      listPath="/purchase/orders"
      recordPath={purchaseOrderRecordPath}
      domain={PURCHASE_PO_DOMAIN}
    />
  )
}

export const Route = createFileRoute('/purchase/orders')({
  component: PurchaseOrders,
  beforeLoad: requireAuth,
})
