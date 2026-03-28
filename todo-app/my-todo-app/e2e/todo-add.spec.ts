import { test, expect } from '@playwright/test'

test.describe('US1: 할 일 추가 및 조회', () => {
  test('할 일을 추가하면 목록에 나타난다', async ({ page }) => {
    await page.goto('/')

    const input = page.getByPlaceholder(/할 일을 입력/)
    await input.fill('E2E 테스트 할 일')
    await page.getByRole('button', { name: /추가/ }).click()

    await expect(page.getByText('E2E 테스트 할 일')).toBeVisible()
  })

  test('페이지 새로고침 후에도 추가한 할 일이 유지된다', async ({ page }) => {
    await page.goto('/')

    const title = `새로고침 테스트 ${Date.now()}`
    await page.getByPlaceholder(/할 일을 입력/).fill(title)
    await page.getByRole('button', { name: /추가/ }).click()
    await expect(page.getByText(title)).toBeVisible()

    await page.reload()
    await expect(page.getByText(title)).toBeVisible()
  })

  test('빈 입력으로 추가 시 항목이 추가되지 않는다', async ({ page }) => {
    await page.goto('/')
    const initialItems = await page.getByRole('checkbox').count()

    await page.getByRole('button', { name: /추가/ }).click()

    await expect(page.getByRole('checkbox')).toHaveCount(initialItems)
  })
})
