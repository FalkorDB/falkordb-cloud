import { test, expect } from '@playwright/test'

test('Test login', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Support' }).nth(1).click()
  // await page.getByText('Sign in').click()

  await page.waitForURL('/support')

  await page.getByText('Join us on Discord').click()

  await page.waitForURL('https://discord.com/invite/99y2Ubh6tg')
})