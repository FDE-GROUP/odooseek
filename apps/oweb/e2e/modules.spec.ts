import { expect, test } from '@playwright/test'

/**
 * Page-level navigation smoke tests.
 * Auth handled by globalSetup (e2e/global-setup.ts) — all tests share session.
 */
test.describe('Route navigation', () => {
  const routes = [
    '/crm/pipeline',
    '/crm/leads',
    '/hr/employees',
    '/hr/directory',
    '/hr/departments',
    '/hr/jobs',
    '/hr/work-locations',
    '/hr/plans',
    '/purchase/rfqs',
    '/purchase/orders',
    '/project/tasks',
    '/project/projects',
    '/contacts/partners',
    '/accounting/moves',
    '/sale/orders',
    '/inventory/pickings',
    '/settings',
  ]

  for (const route of routes) {
    test(`${route} loads`, async ({ page }) => {
      await page.goto(route)
      // Should stay on route (not redirected to login)
      await expect(page).toHaveURL(new RegExp(route), { timeout: 15_000 })
    })
  }
})
