import { test, expect } from '@playwright/test'

// 배포 URL 대상 E2E 테스트
// 실행: PLAYWRIGHT_BASE_URL=https://your-app.vercel.app npx playwright test e2e/todo-deployed.spec.ts

test.describe('US4: 배포된 앱 접근', () => {
  test('배포된 URL로 앱이 정상 로드된다', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('나의 할 일')).toBeVisible()
  })

  test('배포된 앱에서 할 일 추가/완료/삭제가 정상 동작한다', async ({ page }) => {
    await page.goto('/')

    const title = `배포 테스트 ${Date.now()}`

    // 추가
    await page.getByPlaceholder(/할 일을 입력/).fill(title)
    await page.getByRole('button', { name: /추가/ }).click()
    await expect(page.getByText(title)).toBeVisible()

    // 완료
    const todoItem = page.locator('li').filter({ hasText: title })
    await todoItem.getByRole('checkbox').click()
    await expect(todoItem.getByText(title)).toHaveClass(/line-through/)

    // 삭제
    await todoItem.getByRole('button', { name: /삭제/ }).click()
    await expect(page.getByText(title)).not.toBeVisible()
  })
})
