import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { PRODUCT_ACTION_XML_ID, PRODUCT_TEMPLATE_MODEL, productRecordPath } from '../../lib/product'

function Products() {
  return (
    <ModuleRoute
      model={PRODUCT_TEMPLATE_MODEL}
      actionXmlId={PRODUCT_ACTION_XML_ID.products}
      listPath="/product/products"
      recordPath={productRecordPath}
    />
  )
}

export const Route = createFileRoute('/product/products')({
  component: Products,
  beforeLoad: requireAuth,
})
