import { test, expect } from '@playwright/test'

test.describe('US2: 할 일 완료 처리', () => {
  test('체크박스 클릭 시 완료 스타일이 적용된다', async ({ page }) => {
    await page.goto('/')

    // 할 일 추가
    const title = `완료 테스트 ${Date.now()}`
    await page.getByPlaceholder(/할 일을 입력/).fill(title)
    await page.getByRole('button', { name: /추가/ }).click()
    await expect(page.getByText(title)).toBeVisible()

    // 체크박스 클릭
    const todoItem = page.locator('li').filter({ hasText: title })
    await todoItem.getByRole('checkbox').click()

    // 취소선 스타일 확인
    const titleEl = todoItem.getByText(title)
    await expect(titleEl).toHaveClass(/line-through/)
  })

  test('완료 상태가 새로고침 후에도 유지된다', async ({ page }) => {
    await page.goto('/')

    const title = `완료 유지 테스트 ${Date.now()}`
    await page.getByPlaceholder(/할 일을 입력/).fill(title)
    await page.getByRole('button', { name: /추가/ }).click()
    await expect(page.getByText(title)).toBeVisible()

    const todoItem = page.locator('li').filter({ hasText: title })
    await todoItem.getByRole('checkbox').click()
    await expect(todoItem.getByText(title)).toHaveClass(/line-through/)

    await page.reload()
    const reloadedItem = page.locator('li').filter({ hasText: title })
    await expect(reloadedItem.getByText(title)).toHaveClass(/line-through/)
  })

  test('완료 항목 체크박스 다시 클릭 시 미완료 상태로 복원된다', async ({ page }) => {
    await page.goto('/')

    const title = `토글 테스트 ${Date.now()}`
    await page.getByPlaceholder(/할 일을 입력/).fill(title)
    await page.getByRole('button', { name: /추가/ }).click()
    await expect(page.getByText(title)).toBeVisible()

    const todoItem = page.locator('li').filter({ hasText: title })
    await todoItem.getByRole('checkbox').click() // 완료
    await expect(todoItem.getByText(title)).toHaveClass(/line-through/)

    await todoItem.getByRole('checkbox').click() // 미완료
    await expect(todoItem.getByText(title)).not.toHaveClass(/line-through/)
  })
})
