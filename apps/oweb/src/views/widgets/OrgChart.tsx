import { read, searchRead } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { memo } from 'react'
import { OrgChartViewport } from '../../components/OrgChartViewport'
import { HR_DEPARTMENT_MODEL, HR_EMPLOYEE_MODEL, hrEmployeeRecordPath } from '../../lib/hr'
import { resolveOdooImageSrc } from '../../lib/odoo-image'
import type { FieldWidgetProps } from './index'

export interface OrgNode {
  id: number
  name: string
  parent_id: [number, string] | false | number
  child_ids: number[]
  job_title?: string
  department_id?: [number, string] | false
  image_128?: string | false
}

export type TreeOrgNode = OrgNode & { children: TreeOrgNode[]; depth: number }

const ORG_FIELDS = [
  'id',
  'name',
  'parent_id',
  'child_ids',
  'job_title',
  'department_id',
  'image_128',
] as const

export function parentIdOf(node: OrgNode): number | false {
  const p = node.parent_id
  if (Array.isArray(p)) return p[0] ?? false
  if (typeof p === 'number') return p
  return false
}

/** Walk up parent_id until root (no parent). */
export function findOrgRootId(nodes: OrgNode[], startId: number): number {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  let current = byId.get(startId)
  let guard = 0
  while (current && guard++ < 64) {
    const pid = parentIdOf(current)
    if (!pid || !byId.has(pid)) return current.id
    current = byId.get(pid)
  }
  return startId
}

/** Pick org chart root on department form: manager chain, else first member. */
export function resolveDepartmentOrgRootId(
  members: OrgNode[],
  departmentId: number,
  managerId: number | false,
): number {
  if (managerId && members.some((n) => n.id === managerId)) {
    return findOrgRootId(members, managerId)
  }
  return members[0]?.id ?? departmentId
}

export function buildTree(
  nodes: OrgNode[],
  rootId: number,
  depth = 0,
  maxDepth = 5,
): TreeOrgNode | null {
  if (depth > maxDepth) return null
  const root = nodes.find((n) => n.id === rootId)
  if (!root) return null
  const children = (root.child_ids ?? [])
    .map((cid) => buildTree(nodes, cid, depth + 1, maxDepth))
    .filter((c): c is TreeOrgNode => c != null)
  return { ...root, children, depth }
}

/** Count nodes in built tree (for viewport toolbar / perf baseline). */
export function countTreeNodes(node: TreeOrgNode | null): number {
  if (!node) return 0
  return 1 + node.children.reduce((sum, c) => sum + countTreeNodes(c), 0)
}

async function fetchEmployeeOrgNodes(
  employeeId: number,
  departmentId?: number,
): Promise<OrgNode[]> {
  const [employee] = await searchRead<OrgNode[]>(
    HR_EMPLOYEE_MODEL,
    [['id', '=', employeeId]],
    [...ORG_FIELDS],
    0,
    1,
  )
  if (!employee) return []

  const chainIds = new Set<number>([employeeId])
  let pid = parentIdOf(employee)
  let guard = 0
  while (pid && guard++ < 32) {
    chainIds.add(pid)
    const [parent] = await read<OrgNode[]>(HR_EMPLOYEE_MODEL, [pid], [...ORG_FIELDS])
    if (!parent) break
    pid = parentIdOf(parent)
  }

  const domain: unknown[] = departmentId
    ? [
        ['active', '=', true],
        '|',
        ['department_id', '=', departmentId],
        ['id', 'in', [...chainIds]],
      ]
    : [['id', 'in', [...chainIds]]]

  return searchRead<OrgNode[]>(HR_EMPLOYEE_MODEL, domain, [...ORG_FIELDS], 0, 200)
}

async function fetchDepartmentOrgNodes(departmentId: number): Promise<{
  nodes: OrgNode[]
  managerId: number | false
}> {
  const [dept] = await read<Array<{ manager_id: [number, string] | false }>>(
    HR_DEPARTMENT_MODEL,
    [departmentId],
    ['manager_id'],
  )
  const managerId = Array.isArray(dept?.manager_id) ? dept.manager_id[0] : false
  if (!managerId) {
    const nodes = await searchRead<OrgNode[]>(
      HR_EMPLOYEE_MODEL,
      [
        ['department_id', '=', departmentId],
        ['active', '=', true],
      ],
      [...ORG_FIELDS],
      0,
      200,
    )
    return { nodes, managerId: false }
  }
  const nodes = await fetchEmployeeOrgNodes(managerId, departmentId)
  return { nodes, managerId }
}

const TreeNode = memo(function TreeNode({
  node,
  onNodeClick,
}: {
  node: TreeOrgNode
  onNodeClick: (id: number) => void
}) {
  const src = resolveOdooImageSrc({
    raw: node.image_128,
    model: HR_EMPLOYEE_MODEL,
    recordId: node.id,
  })
  return (
    <li>
      <button
        type="button"
        data-org-node
        className="flex flex-col items-center cursor-pointer group border-0 bg-transparent p-0"
        onClick={() => onNodeClick(node.id)}
      >
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-accent/10 text-sm font-semibold text-accent ring-2 ring-accent/20 group-hover:ring-accent/50 transition-all">
          {src ? (
            <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            node.name.charAt(0).toUpperCase()
          )}
        </div>
        <span className="mt-1 text-[11px] font-medium text-text-primary leading-tight text-center max-w-[80px] truncate">
          {node.name}
        </span>
        {node.job_title && (
          <span className="text-[10px] text-text-muted truncate max-w-[80px]">
            {node.job_title}
          </span>
        )}
      </button>
      {node.children.length > 0 && (
        <ul className="mt-2 flex items-start justify-center gap-3 border-t-2 border-border-subtle pt-3">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} onNodeClick={onNodeClick} />
          ))}
        </ul>
      )}
    </li>
  )
})

export function OrgChartWidget(props: FieldWidgetProps) {
  const { record, model: parentModel, recordId } = props
  const navigate = useNavigate()
  const employeeId = recordId ?? (record?.id as number | undefined)
  const departmentId = Array.isArray(record?.department_id)
    ? (record.department_id as [number, string])[0]
    : undefined
  const isDepartmentForm = parentModel === HR_DEPARTMENT_MODEL

  const { data, isLoading } = useQuery({
    queryKey: ['odoo', 'orgchart', parentModel, employeeId, departmentId],
    queryFn: async () => {
      if (isDepartmentForm && recordId) {
        const { nodes: members, managerId } = await fetchDepartmentOrgNodes(recordId)
        const rootId = resolveDepartmentOrgRootId(members, recordId, managerId)
        return { members, rootId }
      }
      if (!employeeId) return null
      const members = await fetchEmployeeOrgNodes(employeeId, departmentId)
      const rootId = findOrgRootId(members, employeeId)
      return { members, rootId }
    },
    enabled: !!recordId || !!employeeId,
    staleTime: 5 * 60_000,
  })

  const handleNodeClick = (id: number) => {
    navigate({ to: hrEmployeeRecordPath(id) })
  }

  if (!employeeId && !isDepartmentForm) {
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

  if (!data?.members.length) {
    return <div className="text-sm text-text-muted py-3 text-center">No organization data</div>
  }

  const tree = buildTree(data.members, data.rootId)
  if (!tree) {
    return <div className="text-sm text-text-muted py-3 text-center">Could not build org chart</div>
  }

  const nodeCount = countTreeNodes(tree)

  return (
    <OrgChartViewport nodeCount={nodeCount}>
      <ul className="flex items-start justify-center">
        <TreeNode node={tree} onNodeClick={handleNodeClick} />
      </ul>
    </OrgChartViewport>
  )
}
