import { read, searchRead } from '@odooseek/odoo-client'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { OrgChartViewport } from '../../components/OrgChartViewport'
import {
  HR_DEPARTMENT_MODEL,
  HR_EMPLOYEE_MODEL,
  hrEmployeeRecordPath,
  hrEmployeesNavigateOptions,
} from '../../lib/hr'
import {
  buildOrgChartFromNodes,
  countOrgChartEntries,
  fetchHrOrgChart,
  fetchHrSubordinates,
  type OrgChartSubordinatesType,
  type OrgNode,
  parentIdOf,
} from '../../lib/hr-org-chart'
import type { FieldWidgetProps } from './index'
import { OrgChartLayout } from './OrgChartLayout'

export type { OrgNode } from '../../lib/hr-org-chart'
export { parentIdOf } from '../../lib/hr-org-chart'

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

/** Count nodes in built tree (legacy helper for tests). */
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

async function loadOrgChartData(opts: {
  employeeId: number
  newParentId?: number | null
  maxLevel?: number | null
  fallbackNodes?: () => Promise<OrgNode[]>
}) {
  try {
    return await fetchHrOrgChart(opts.employeeId, {
      newParentId: opts.newParentId,
      maxLevel: opts.maxLevel,
    })
  } catch {
    if (!opts.fallbackNodes) throw new Error('Org chart unavailable')
    const nodes = await opts.fallbackNodes()
    const maxManagers = opts.maxLevel ?? undefined
    return buildOrgChartFromNodes(nodes, opts.employeeId, maxManagers)
  }
}

export function OrgChartWidget(props: FieldWidgetProps) {
  const { record, model: parentModel, recordId } = props
  const navigate = useNavigate()
  const [maxLevel, setMaxLevel] = useState<number | null>(null)

  const employeeId = recordId ?? (record?.id as number | undefined)
  const departmentId = Array.isArray(record?.department_id)
    ? (record.department_id as [number, string])[0]
    : undefined
  const isDepartmentForm = parentModel === HR_DEPARTMENT_MODEL
  const newParentId = Array.isArray(record?.parent_id)
    ? (record.parent_id as [number, string])[0]
    : null

  const { data, isLoading } = useQuery({
    queryKey: ['odoo', 'orgchart', parentModel, employeeId, departmentId, newParentId, maxLevel],
    queryFn: async () => {
      if (isDepartmentForm && recordId) {
        const { nodes: members, managerId } = await fetchDepartmentOrgNodes(recordId)
        const focusId = resolveDepartmentOrgRootId(members, recordId, managerId)
        const chart = await loadOrgChartData({
          employeeId: focusId,
          maxLevel,
          fallbackNodes: async () => members,
        })
        return { chart, viewEmployeeId: focusId }
      }
      if (!employeeId) return null
      const chart = await loadOrgChartData({
        employeeId,
        newParentId,
        maxLevel,
        fallbackNodes: async () => fetchEmployeeOrgNodes(employeeId, departmentId),
      })
      return { chart, viewEmployeeId: employeeId }
    },
    enabled: !!recordId || !!employeeId,
    staleTime: 5 * 60_000,
  })

  const handleEmployeeClick = useCallback(
    (id: number) => navigate({ to: hrEmployeeRecordPath(id) }),
    [navigate],
  )

  const handleMoreManagers = useCallback(() => setMaxLevel(100), [])

  const openTeamList = useCallback(
    async (employeeId: number, type: OrgChartSubordinatesType) => {
      try {
        const ids = await fetchHrSubordinates(employeeId, type)
        if (!ids.length) return
        navigate(hrEmployeesNavigateOptions(ids))
      } catch {
        handleEmployeeClick(employeeId)
      }
    },
    [navigate, handleEmployeeClick],
  )

  const handleSeeAll = useCallback(async () => {
    const selfId = data?.viewEmployeeId
    if (!selfId) return
    await openTeamList(selfId, 'direct')
  }, [data?.viewEmployeeId, openTeamList])

  if (!employeeId && !isDepartmentForm) {
    return (
      <div className="py-3 text-center text-sm text-text-muted">
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

  if (!data?.chart) {
    return <div className="py-3 text-center text-sm text-text-muted">No organization data</div>
  }

  const nodeCount = countOrgChartEntries(data.chart)

  return (
    <OrgChartViewport nodeCount={nodeCount}>
      <OrgChartLayout
        data={data.chart}
        viewEmployeeId={data.viewEmployeeId}
        onEmployeeClick={handleEmployeeClick}
        onMoreManagers={data.chart.managers_more ? handleMoreManagers : undefined}
        onSeeAll={handleSeeAll}
        onOpenTeam={openTeamList}
      />
    </OrgChartViewport>
  )
}
