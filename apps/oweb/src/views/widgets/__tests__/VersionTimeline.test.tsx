import { describe, expect, test, vi } from 'vitest'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({ data: [], isLoading: false }),
}))

vi.mock('@odooseek/odoo-client', () => ({
  searchRead: vi.fn().mockResolvedValue([]),
}))

describe('VersionTimeline', () => {
  test('module can be imported', async () => {
    const mod = await import('../VersionTimeline')
    expect(mod.VersionTimeline).toBeDefined()
  })

  test('widget is registered as version_timeline in overrides', async () => {
    const { getFieldWidget } = await import('../index')
    const field = { name: 'test', widget: 'version_timeline', type: 'char' } as any
    const Widget = getFieldWidget(field, 'char')
    expect(Widget).toBeDefined()
  })
})
