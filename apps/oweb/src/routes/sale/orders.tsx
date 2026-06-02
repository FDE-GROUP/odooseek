import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { ODOO_ACTION_XML_ID } from '../../lib/odoo-actions'

function saleOrderRecordPath(id: number): string {
  return `/sale/order/${id}`
}

function SaleOrders() {
  return (
    <ModuleRoute
      model="sale.order"
      actionXmlId={ODOO_ACTION_XML_ID.sale.orders}
      listPath="/sale/orders"
      recordPath={saleOrderRecordPath}
    />
  )
}

export const Route = createFileRoute('/sale/orders')({
  component: SaleOrders,
  beforeLoad: requireAuth,
})
