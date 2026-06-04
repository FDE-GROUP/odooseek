import { describe, expect, test } from 'vitest'
import { resolveMenuRoute } from '../../../lib/menu-navigation'

describe('accounting routes — menu navigation', () => {
  test('account.move → /accounting/moves', () => {
    expect(resolveMenuRoute({ resModel: 'account.move' })).toMatchObject({
      kind: 'module',
      to: '/accounting/moves',
    })
  })

  test('invoices → /accounting/invoices', () => {
    expect(
      resolveMenuRoute({
        xmlid: 'account.menu_action_move_out_invoice_type',
        resModel: 'account.move',
      }),
    ).toMatchObject({ kind: 'module', to: '/accounting/invoices' })
  })

  test('bills → /accounting/bills', () => {
    expect(
      resolveMenuRoute({
        xmlid: 'account.menu_action_move_in_invoice_type',
        resModel: 'account.move',
      }),
    ).toMatchObject({ kind: 'module', to: '/accounting/bills' })
  })

  test('dashboard → /accounting/dashboard', () => {
    expect(
      resolveMenuRoute({
        xmlid: 'account.menu_board_journal_1',
        resModel: 'account.journal',
      }),
    ).toMatchObject({ kind: 'module', to: '/accounting/dashboard' })
  })

  test('move line → /accounting/journal-items', () => {
    expect(resolveMenuRoute({ resModel: 'account.move.line' })).toMatchObject({
      kind: 'module',
      to: '/accounting/journal-items',
    })
  })

  test('payment → /accounting/payments', () => {
    expect(resolveMenuRoute({ resModel: 'account.payment' })).toMatchObject({
      kind: 'module',
      to: '/accounting/payments',
    })
  })

  test('chart of accounts → /accounting/chart-of-accounts', () => {
    expect(resolveMenuRoute({ resModel: 'account.account' })).toMatchObject({
      kind: 'module',
      to: '/accounting/chart-of-accounts',
    })
  })

  test('taxes → /accounting/taxes', () => {
    expect(resolveMenuRoute({ resModel: 'account.tax' })).toMatchObject({
      kind: 'module',
      to: '/accounting/taxes',
    })
  })
})
