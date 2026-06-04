import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function InventoryTodo() {
  return (
    <ModuleRoute
      model="stock.picking"
      actionXmlId="stock.action_picking_tree_ready"
      listPath="/inventory/todo"
      recordPath={(id) => `/inventory/picking/${id}`}
    />
  )
}

export const Route = createFileRoute('/inventory/todo')({
  component: InventoryTodo,
  beforeLoad: requireAuth,
})
