export interface OrgNode {
  id: number
  name: string
  parent_id: [number, string] | false | number
  child_ids: number[]
  job_title?: string
  department_id?: [number, string] | false
  image_128?: string | false
}

export function parentIdOf(node: OrgNode): number | false {
  const p = node.parent_id
  if (Array.isArray(p)) return p[0] ?? false
  if (typeof p === 'number') return p
  return false
}

export interface OrgChartEmployee {
  id: number
  name: string
  job_name: string
  direct_sub_count: number
  indirect_sub_count: number
  write_date?: number
}

export interface OrgChartData {
  self?: OrgChartEmployee
  managers: OrgChartEmployee[]
  children: OrgChartEmployee[]
  managers_more: boolean
}

export const HR_ORG_CHART_MAX_MANAGERS = 5
export const HR_ORG_CHART_DISPLAY_LIMIT = 19

export type OrgChartSubordinatesType = 'direct' | 'indirect' | 'total'

interface OrgChartRpcResult {
  self?: OrgChartEmployee
  managers?: OrgChartEmployee[]
  children?: OrgChartEmployee[]
  managers_more?: boolean
}

function toOrgChartEmployee(node: OrgNode): OrgChartEmployee {
  const childIds = (node.child_ids ?? []).filter((id) => id !== node.id)
  return {
    id: node.id,
    name: node.name,
    job_name: node.job_title ?? '',
    direct_sub_count: childIds.length,
    indirect_sub_count: childIds.length,
    write_date: 0,
  }
}

/** Client-side fallback mirroring Odoo `HrOrgChartController.get_org_chart`. */
export function buildOrgChartFromNodes(
  nodes: OrgNode[],
  focusId: number,
  maxManagers = HR_ORG_CHART_MAX_MANAGERS,
): OrgChartData {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const selfNode = byId.get(focusId)
  if (!selfNode) {
    return { managers: [], children: [], managers_more: false }
  }

  const ancestors: OrgNode[] = []
  let pid = parentIdOf(selfNode)
  while (pid && byId.has(pid) && ancestors.length < maxManagers + 1) {
    const parent = byId.get(pid)
    if (!parent) break
    if (ancestors.some((a) => a.id === parent.id)) break
    ancestors.push(parent)
    pid = parentIdOf(parent)
  }

  const managersMore = ancestors.length > maxManagers
  const managers = ancestors.slice(0, maxManagers).reverse().map(toOrgChartEmployee)

  const children = (selfNode.child_ids ?? [])
    .filter((id) => id !== focusId && byId.has(id))
    .flatMap((id) => {
      const child = byId.get(id)
      return child ? [toOrgChartEmployee(child)] : []
    })

  return {
    self: toOrgChartEmployee(selfNode),
    managers,
    children,
    managers_more: managersMore,
  }
}

export function countOrgChartEntries(data: OrgChartData): number {
  return data.managers.length + (data.self ? 1 : 0) + data.children.length
}

/** Entries visible in Odoo layout (managers + self + capped direct reports). */
export function visibleOrgChartEntries(data: OrgChartData): number {
  let count = data.managers.length + (data.self ? 1 : 0)
  const remaining = HR_ORG_CHART_DISPLAY_LIMIT - count
  count += Math.max(0, Math.min(data.children.length, remaining))
  return count
}

export async function fetchHrOrgChart(
  employeeId: number,
  opts?: { newParentId?: number | null; maxLevel?: number | null },
): Promise<OrgChartData> {
  const res = await fetch('/api/odoo-http/hr/get_org_chart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: {
        employee_id: employeeId,
        new_parent_id: opts?.newParentId ?? null,
        context: { max_level: opts?.maxLevel ?? null },
      },
      id: 1,
    }),
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const payload = (await res.json()) as { result?: OrgChartRpcResult; error?: { message: string } }
  if (payload.error) {
    throw new Error(payload.error.message)
  }

  const result = payload.result ?? {}
  return {
    self: result.self,
    managers: result.managers ?? [],
    children: result.children ?? [],
    managers_more: result.managers_more ?? false,
  }
}

export function teamDomainFromEmployeeIds(ids: number[]): unknown[] | undefined {
  const valid = ids.filter((id) => Number.isFinite(id) && id > 0)
  if (!valid.length) return undefined
  return [['id', 'in', valid]]
}

export function parseEmployeeIdsSearch(ids?: string): number[] | undefined {
  if (!ids?.trim()) return undefined
  const parsed = ids
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isFinite(id) && id > 0)
  return parsed.length ? parsed : undefined
}

/** Odoo `/hr/get_subordinates` — ids for direct, indirect, or all subordinates. */
export async function fetchHrSubordinates(
  employeeId: number,
  subordinatesType: OrgChartSubordinatesType = 'direct',
): Promise<number[]> {
  const res = await fetch('/api/odoo-http/hr/get_subordinates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: {
        employee_id: employeeId,
        subordinates_type: subordinatesType,
        context: {},
      },
      id: 1,
    }),
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const payload = (await res.json()) as { result?: number[]; error?: { message: string } }
  if (payload.error) {
    throw new Error(payload.error.message)
  }

  return Array.isArray(payload.result) ? payload.result : []
}
