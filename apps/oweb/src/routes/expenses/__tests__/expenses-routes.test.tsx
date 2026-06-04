import { describe, expect, test } from 'vitest'
import { resolveMenuRoute } from '../../../lib/menu-navigation'

describe('expenses routes', () => {
  test('expense menu → /expenses/my', () => {
    expect(
      resolveMenuRoute({
        xmlid: 'hr_expense.menu_hr_expense_root',
        resModel: 'hr.expense',
      }),
    ).toMatchObject({ kind: 'module', to: '/expenses/my' })
  })

  test('hr.expense by resModel → /expenses/my', () => {
    expect(resolveMenuRoute({ resModel: 'hr.expense' })).toMatchObject({
      kind: 'module',
      to: '/expenses/my',
    })
  })
})
