import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function ProductCategories() {
  return (
    <ModuleRoute
      model="product.category"
      actionXmlId="product.product_category_action_form"
      listPath="/product/categories"
      recordPath={(id) => `/product/category/${id}`}
    />
  )
}

export const Route = createFileRoute('/product/categories')({
  component: ProductCategories,
  beforeLoad: requireAuth,
})
