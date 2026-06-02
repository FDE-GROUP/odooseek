import { describe, expect, test } from 'vitest'
import {
  buildOrgChartFromNodes,
  countOrgChartEntries,
  type OrgChartData,
  type OrgNode,
  visibleOrgChartEntries,
} from '../hr-org-chart'

const nodes: OrgNode[] = [
  { id: 1, name: 'CEO', parent_id: false, child_ids: [2] },
  { id: 2, name: 'Mgr', parent_id: [1, 'CEO'], child_ids: [3, 4] },
  { id: 3, name: 'Dev', parent_id: [2, 'Mgr'], child_ids: [] },
  { id: 4, name: 'Dev2', parent_id: [2, 'Mgr'], child_ids: [] },
]

describe('buildOrgChartFromNodes', () => {
  test('builds managers chain, self, and direct children only', () => {
    const data = buildOrgChartFromNodes(nodes, 3)
    expect(data.managers.map((m) => m.id)).toEqual([1, 2])
    expect(data.self?.id).toBe(3)
    expect(data.children).toEqual([])
  })

  test('lists direct reports under self', () => {
    const data = buildOrgChartFromNodes(nodes, 2)
    expect(data.self?.id).toBe(2)
    expect(data.children.map((c) => c.id)).toEqual([3, 4])
    expect(data.children[0]?.direct_sub_count).toBe(0)
  })
})

describe('countOrgChartEntries', () => {
  test('counts all sections', () => {
    const data: OrgChartData = {
      managers: [{ id: 1, name: 'A', job_name: '', direct_sub_count: 0, indirect_sub_count: 0 }],
      self: { id: 2, name: 'B', job_name: '', direct_sub_count: 1, indirect_sub_count: 1 },
      children: [{ id: 3, name: 'C', job_name: '', direct_sub_count: 0, indirect_sub_count: 0 }],
      managers_more: false,
    }
    expect(countOrgChartEntries(data)).toBe(3)
    expect(visibleOrgChartEntries(data)).toBe(3)
  })
})
