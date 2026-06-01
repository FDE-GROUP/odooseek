import { describe, expect, test, vi } from 'vitest'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({ data: null, isLoading: false }),
}))

describe('OrgChart', () => {
  test('module can be imported', async () => {
    const mod = await import('../OrgChart')
    expect(mod.OrgChartWidget).toBeDefined()
  })

  test('widget is registered as org_chart in overrides', async () => {
    const { getFieldWidget } = await import('../index')
    const field = { name: 'test', widget: 'org_chart', type: 'char' } as any
    const Widget = getFieldWidget(field, 'char')
    expect(Widget).toBeDefined()
  })
})
