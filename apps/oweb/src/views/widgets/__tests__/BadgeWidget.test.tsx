import { describe, expect, test } from 'vitest'

describe('BadgeWidget', () => {
  test('module can be imported', async () => {
    const mod = await import('../BadgeWidget')
    expect(mod.BadgeWidget).toBeDefined()
  })

  test('widget is registered as badge_print in overrides', async () => {
    const { getFieldWidget } = await import('../index')
    const field = { name: 'test', widget: 'badge_print', type: 'char' } as any
    const Widget = getFieldWidget(field, 'char')
    expect(Widget).toBeDefined()
  })
})
