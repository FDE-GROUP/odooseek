import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function ProductCategory() {
  return <ModuleRoute model="product.category" listPath="/product/categories" />
}

export const Route = createFileRoute('/product/category/$categoryId')({
  component: ProductCategory,
  beforeLoad: requireAuth,
})
