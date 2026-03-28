import { test, expect } from '@playwright/test'

test.describe('US3: 할 일 삭제', () => {
  test('삭제 버튼 클릭 시 항목이 목록에서 사라진다', async ({ page }) => {
    await page.goto('/')

    const title = `삭제 테스트 ${Date.now()}`
    await page.getByPlaceholder(/할 일을 입력/).fill(title)
    await page.getByRole('button', { name: /추가/ }).click()
    await expect(page.getByText(title)).toBeVisible()

    const todoItem = page.locator('li').filter({ hasText: title })
    await todoItem.getByRole('button', { name: /삭제/ }).click()

    await expect(page.getByText(title)).not.toBeVisible()
  })

  test('삭제 후 새로고침해도 항목이 나타나지 않는다', async ({ page }) => {
    await page.goto('/')

    const title = `삭제 유지 테스트 ${Date.now()}`
    await page.getByPlaceholder(/할 일을 입력/).fill(title)
    await page.getByRole('button', { name: /추가/ }).click()
    await expect(page.getByText(title)).toBeVisible()

    const todoItem = page.locator('li').filter({ hasText: title })
    await todoItem.getByRole('button', { name: /삭제/ }).click()
    await expect(page.getByText(title)).not.toBeVisible()

    await page.reload()
    await expect(page.getByText(title)).not.toBeVisible()
  })
})
