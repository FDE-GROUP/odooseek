import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import {
  PURCHASE_ACTION_XML_ID,
  PURCHASE_ORDER_MODEL,
  PURCHASE_RFQ_DOMAIN,
  purchaseOrderRecordPath,
} from '../../lib/purchase'

function PurchaseRfqs() {
  return (
    <ModuleRoute
      model={PURCHASE_ORDER_MODEL}
      actionXmlId={PURCHASE_ACTION_XML_ID.rfqs}
      listPath="/purchase/rfqs"
      recordPath={purchaseOrderRecordPath}
      domain={PURCHASE_RFQ_DOMAIN}
    />
  )
}

export const Route = createFileRoute('/purchase/rfqs')({
  component: PurchaseRfqs,
  beforeLoad: requireAuth,
})
