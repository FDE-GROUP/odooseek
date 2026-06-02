import { describe, expect, test, vi } from 'vitest'
import { buildOrgChartFromNodes, type OrgNode } from '../../../lib/hr-org-chart'
import {
  buildTree,
  countTreeNodes,
  findOrgRootId,
  parentIdOf,
  resolveDepartmentOrgRootId,
} from '../OrgChart'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({ data: null, isLoading: false }),
}))

const nodes: OrgNode[] = [
  { id: 1, name: 'CEO', parent_id: false, child_ids: [2] },
  { id: 2, name: 'Mgr', parent_id: [1, 'CEO'], child_ids: [3] },
  { id: 3, name: 'Dev', parent_id: [2, 'Mgr'], child_ids: [] },
]

describe('OrgChart helpers', () => {
  test('findOrgRootId walks to top parent', () => {
    expect(findOrgRootId(nodes, 3)).toBe(1)
  })

  test('parentIdOf reads m2o tuple', () => {
    expect(parentIdOf(nodes[2])).toBe(2)
  })

  test('buildTree nests child_ids', () => {
    const tree = buildTree(nodes, 1)
    expect(tree?.children[0]?.id).toBe(2)
    expect(tree?.children[0]?.children[0]?.id).toBe(3)
    expect(countTreeNodes(tree)).toBe(3)
  })

  test('buildOrgChartFromNodes matches Odoo flat layout sections', () => {
    const data = buildOrgChartFromNodes(nodes, 2)
    expect(data.managers.map((m) => m.id)).toEqual([1])
    expect(data.self?.id).toBe(2)
    expect(data.children.map((c) => c.id)).toEqual([3])
  })

  test('resolveDepartmentOrgRootId uses manager when present', () => {
    expect(resolveDepartmentOrgRootId(nodes, 99, 3)).toBe(1)
  })

  test('resolveDepartmentOrgRootId falls back without manager', () => {
    expect(resolveDepartmentOrgRootId(nodes, 99, false)).toBe(1)
  })
})

describe('OrgChart widget', () => {
  test('module can be imported', async () => {
    const mod = await import('../OrgChart')
    expect(mod.OrgChartWidget).toBeDefined()
  })
})
