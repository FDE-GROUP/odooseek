import { chromium } from '@playwright/test'

export default async function globalSetup() {
  const db = process.env.E2E_DB!
  const login = process.env.E2E_LOGIN!
  const password = process.env.E2E_PASSWORD!

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(`${process.env.E2E_BASE_URL ?? 'http://localhost:5173'}/login`)
  await page.locator('#db').fill(db)
  await page.locator('#login').fill(login)
  await page.locator('#password').fill(password)
  await page.getByTestId('login-submit').click()
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 })

  await context.storageState({ path: '.e2e-auth.json' })
  await browser.close()
}
