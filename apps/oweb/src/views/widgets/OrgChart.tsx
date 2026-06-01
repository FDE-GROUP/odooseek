import { searchRead } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import type { FieldWidgetProps } from './index'

interface OrgNode {
  id: number
  name: string
  parent_id: [number, string] | false
  child_ids: number[]
  job_title?: string
  department_id?: [number, string] | false
}

type TreeOrgNode = OrgNode & { children: TreeOrgNode[]; depth: number }

function buildTree(nodes: OrgNode[], rootId: number, depth = 0, maxDepth = 5): TreeOrgNode | null {
  if (depth > maxDepth) return null
  const root = nodes.find((n) => n.id === rootId)
  if (!root) return null
  const children = root.child_ids
    .map((cid) => buildTree(nodes, cid, depth + 1, maxDepth))
    .filter(Boolean) as TreeOrgNode[]
  return { ...root, children, depth }
}

function TreeNode({
  node,
  onNodeClick,
}: {
  node: TreeOrgNode
  onNodeClick?: (id: number) => void
}) {
  return (
    <li>
      <div
        className="flex flex-col items-center cursor-pointer group"
        onClick={() => onNodeClick?.(node.id)}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent ring-2 ring-accent/20 group-hover:ring-accent/50 transition-all">
          {node.name.charAt(0).toUpperCase()}
        </div>
        <span className="mt-1 text-[11px] font-medium text-text-primary leading-tight text-center max-w-[80px] truncate">
          {node.name}
        </span>
        {node.job_title && (
          <span className="text-[10px] text-text-muted truncate max-w-[80px]">
            {node.job_title}
          </span>
        )}
      </div>
      {node.children.length > 0 && (
        <ul className="mt-2 flex items-start justify-center gap-3 border-t-2 border-border-subtle pt-3">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} onNodeClick={onNodeClick} />
          ))}
        </ul>
      )}
    </li>
  )
}

export function OrgChartWidget(props: FieldWidgetProps) {
  const { record, model: parentModel, recordId } = props
  const employeeId = recordId ?? (record?.id as number | undefined)
  const departmentId = record?.department_id as [number, string] | false

  const queryKey = ['odoo', 'orgchart', parentModel, employeeId]

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!employeeId) return null

      // Fetch the employee and their manager chain
      const [employee] = await searchRead<OrgNode[]>(
        'hr.employee',
        [['id', '=', employeeId]],
        ['id', 'name', 'parent_id', 'child_ids', 'job_title', 'department_id'],
        0,
        1,
      )
      if (!employee) return null

      // Get root (top of chain) + all subordinates
      const rawRoot = Number(
        Array.isArray(employee.parent_id) ? employee.parent_id[0] : employee.parent_id || 0,
      )

      // Fetch department members for context
      const members = departmentId
        ? await searchRead<OrgNode[]>(
            'hr.employee',
            [
              ['department_id', '=', departmentId[0]],
              ['active', '=', true],
            ],
            ['id', 'name', 'parent_id', 'child_ids', 'job_title'],
            0,
            50,
          )
        : []

      return { rootId: rawRoot || employeeId, members }
    },
    enabled: !!employeeId,
    staleTime: 5 * 60_000,
  })

  if (!employeeId) {
    return (
      <div className="text-sm text-text-muted py-3 text-center">
        Organization chart not available
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return <div className="text-sm text-text-muted py-3 text-center">No organization data</div>
  }

  const tree = buildTree(data.members, data.rootId)

  if (!tree) {
    return (
      <div className="text-sm text-text-muted py-3 text-center">
        {data.members.length === 0 ? 'No team members' : 'Could not build org chart'}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto py-4">
      <ul className="flex items-start justify-center">
        {tree.children.length > 0 ? (
          tree.children.map((child) => <TreeNode key={child.id} node={child} />)
        ) : (
          <TreeNode node={tree} />
        )}
      </ul>
    </div>
  )
}
