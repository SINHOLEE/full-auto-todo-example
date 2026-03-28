# Tasks: Todo Web App (바이브코딩)

**Input**: Design documents from `/specs/001-todo-webapp/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/supabase-schema.sql ✅, quickstart.md ✅

**Tests**: Jest + React Testing Library (단위/컴포넌트), Playwright (E2E) — 구현 전 테스트 먼저 작성 (TDD)

**Organization**: 유저 스토리별로 태스크를 그룹화하여 각 스토리를 독립적으로 구현 및 테스트 가능하게 구성.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[Story]**: 해당 유저 스토리 레이블 (US1~US4)
- 각 태스크에 정확한 파일 경로 포함

---

## Phase 1: Setup (프로젝트 초기화)

**Purpose**: Next.js 프로젝트 생성 및 기본 구조 설정

- [x] T001 Create Next.js project using `npx create-next-app@latest my-todo-app --typescript --tailwind --app --no-src-dir --import-alias "@/*"` in `/Users/siny/WebstormProjects/full-auto-todo-example/todo-app/`
- [x] T002 Install Supabase client dependency: `npm install @supabase/supabase-js` in `my-todo-app/`
- [x] T003 [P] Install Jest + React Testing Library: `npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest` in `my-todo-app/`
- [x] T004 [P] Install Playwright: `npm install -D @playwright/test` then `npx playwright install` in `my-todo-app/`
- [x] T005 [P] Configure Jest in `my-todo-app/jest.config.ts`: set `testEnvironment: 'jsdom'`, `setupFilesAfterFramework: ['@testing-library/jest-dom']`, module name mapper for Next.js (`@/` alias)
- [x] T006 [P] Configure Playwright in `my-todo-app/playwright.config.ts`: set `baseURL: 'http://localhost:3000'`, `testDir: './e2e'`, webServer command `npm run dev`
- [x] T007 [P] Create `.env.local` in `my-todo-app/.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` placeholders
- [x] T008 [P] Add `.env.local` to `my-todo-app/.gitignore` (verify it's excluded from git)

---

## Phase 2: Foundational (블로킹 전제조건)

**Purpose**: 모든 유저 스토리 구현 전에 완료되어야 할 핵심 인프라

**⚠️ CRITICAL**: 이 페이즈가 완료되어야 유저 스토리 구현 시작 가능

- [x] T009 Create Supabase `todos` table by executing `specs/001-todo-webapp/contracts/supabase-schema.sql` via Supabase MCP or Supabase SQL Editor (schema: id uuid PK, title text NOT NULL, is_completed boolean DEFAULT false, created_at timestamptz DEFAULT now(); RLS disabled)
- [x] T010 [P] Create Supabase client module in `my-todo-app/lib/supabase.ts` using `createClient` from `@supabase/supabase-js` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` env vars
- [x] T011 [P] Create Todo TypeScript interface in `my-todo-app/types/todo.ts` with fields: `id: string`, `title: string`, `is_completed: boolean`, `created_at: string`

**Checkpoint**: Foundation ready — Supabase DB 테이블 생성 완료, 클라이언트 모듈 및 타입 정의 완료. 유저 스토리 구현 시작 가능.

---

## Phase 3: User Story 1 - 할 일 추가 및 조회 (Priority: P1) 🎯 MVP

**Goal**: 사용자가 할 일을 입력·추가하고, 앱 로드 시 목록을 불러와 표시. 새로고침 후에도 데이터 유지.

**Independent Test**: 입력창에 텍스트 입력 후 추가 버튼 클릭 → 목록에 항목 표시 → 페이지 새로고침 → 항목 여전히 표시. 빈 입력으로 추가 시 목록에 항목 미추가 확인.

### Tests for User Story 1 (TDD — 구현 전 작성, FAIL 확인 후 구현)

- [x] T012 [P] [US1] Write Jest unit test in `my-todo-app/__tests__/page.test.tsx`: mock `lib/supabase` module, render `<Home />`, assert todo list renders mocked todos, assert "나의 할 일" heading is present
- [x] T013 [P] [US1] Write Jest unit test in `my-todo-app/__tests__/page.test.tsx`: test `addTodo` — type text in input, click Add button, assert supabase insert was called with trimmed title; test empty input — click Add with empty input, assert insert NOT called
- [x] T014 [P] [US1] Write Playwright E2E test in `my-todo-app/e2e/todo-add.spec.ts`: navigate to `/`, fill input with "E2E 테스트 할 일", click Add button, assert new item appears in list, reload page, assert item still present

### Implementation for User Story 1

- [x] T015 [US1] Implement main page in `my-todo-app/app/page.tsx` as Client Component (`'use client'`) with: useState for `todos: Todo[]` and `newTitle: string`, useEffect to fetch todos on mount (`SELECT * FROM todos ORDER BY created_at DESC` via supabase), `addTodo` function (trim validation + INSERT + refetch), input field bound to `newTitle`, Add button that calls `addTodo`, and rendered todo list showing each item's title
- [x] T016 [US1] Add empty input validation in `my-todo-app/app/page.tsx`: `addTodo` must call `title.trim()` and return early if empty (FR-006)
- [x] T017 [US1] Style the page in `my-todo-app/app/page.tsx` using Tailwind CSS: "나의 할 일" heading, styled text input and Add button, todo list with each item displayed cleanly (FR-007)

**Checkpoint**: US1 완료 — Jest 테스트 PASS, Playwright E2E PASS. 브라우저에서 `http://localhost:3000` 접속하여 독립 검증 가능.

---

## Phase 4: User Story 2 - 할 일 완료 처리 (Priority: P2)

**Goal**: 각 할 일 항목의 체크박스 클릭으로 완료 상태 토글. 완료 항목 시각적 구분. 새로고침 후에도 상태 유지.

**Independent Test**: 미완료 항목 체크박스 클릭 → 완료 스타일(취소선 등) 적용 → 새로고침 → 완료 상태 유지. 완료 항목 체크박스 다시 클릭 → 미완료 상태로 복원 확인.

### Tests for User Story 2 (TDD — 구현 전 작성, FAIL 확인 후 구현)

- [x] T018 [P] [US2] Write Jest unit test in `my-todo-app/__tests__/page.test.tsx`: mock supabase update call, render todo list with one incomplete item, click its checkbox, assert supabase update was called with `is_completed: true`; click again, assert called with `is_completed: false`
- [x] T019 [P] [US2] Write Jest unit test in `my-todo-app/__tests__/page.test.tsx`: render completed todo, assert title element has `line-through` class (or equivalent completed style)
- [x] T020 [P] [US2] Write Playwright E2E test in `my-todo-app/e2e/todo-toggle.spec.ts`: add a todo, click its checkbox, assert title has strikethrough style, reload page, assert completed state persists; click checkbox again, assert item returns to incomplete style

### Implementation for User Story 2

- [x] T021 [US2] Add `toggleTodo` function in `my-todo-app/app/page.tsx`: takes todo `id` and current `is_completed`, runs `UPDATE todos SET is_completed = !is_completed WHERE id = :id` via supabase, then refetches todos list
- [x] T022 [US2] Add checkbox UI to each todo item in `my-todo-app/app/page.tsx`: `<input type="checkbox">` bound to `is_completed`, `onChange` calls `toggleTodo(todo.id, todo.is_completed)`
- [x] T023 [US2] Add visual distinction for completed todos in `my-todo-app/app/page.tsx` using Tailwind CSS: apply `line-through` and `text-gray-400` (or similar) to title text when `is_completed` is true

**Checkpoint**: US2 완료 — Jest 테스트 PASS, Playwright E2E PASS.

---

## Phase 5: User Story 3 - 할 일 삭제 (Priority: P3)

**Goal**: 각 할 일 항목의 삭제 버튼 클릭으로 항목 영구 삭제. 새로고침 후에도 삭제 상태 유지.

**Independent Test**: 목록에서 특정 항목 삭제 버튼 클릭 → 항목이 즉시 목록에서 사라짐 → 새로고침 → 항목이 다시 나타나지 않음 확인.

### Tests for User Story 3 (TDD — 구현 전 작성, FAIL 확인 후 구현)

- [x] T024 [P] [US3] Write Jest unit test in `my-todo-app/__tests__/page.test.tsx`: mock supabase delete call, render todo list with one item, click its delete button, assert supabase delete was called with correct id, assert item removed from rendered list
- [x] T025 [P] [US3] Write Playwright E2E test in `my-todo-app/e2e/todo-delete.spec.ts`: add a todo, click its delete button, assert item disappears from list immediately, reload page, assert item does not reappear

### Implementation for User Story 3

- [x] T026 [US3] Add `deleteTodo` function in `my-todo-app/app/page.tsx`: takes todo `id`, runs `DELETE FROM todos WHERE id = :id` via supabase, then refetches todos list
- [x] T027 [US3] Add delete button UI to each todo item in `my-todo-app/app/page.tsx`: `<button>` with delete label (e.g., "삭제" or "✕"), `onClick` calls `deleteTodo(todo.id)`, styled with Tailwind CSS

**Checkpoint**: US3 완료 — Jest 테스트 PASS, Playwright E2E PASS. 전체 CRUD 자동화 테스트 완료.

---

## Phase 6: User Story 4 - 인터넷을 통한 앱 접근 (Priority: P4)

**Goal**: 앱을 Vercel에 배포하여 인터넷 어디서든 접근 가능하게 함. 배포 환경에서도 모든 CRUD 기능 정상 동작.

**Independent Test**: 배포된 Vercel URL로 접속 → 앱 정상 로드 → 할 일 추가/완료/삭제가 데이터베이스와 연동되어 정상 동작 확인.

### Tests for User Story 4

- [x] T028 [P] [US4] Write Playwright E2E test in `my-todo-app/e2e/todo-deployed.spec.ts`: set `baseURL` to deployed Vercel URL via env var `PLAYWRIGHT_BASE_URL`, navigate to `/`, assert app loads, add/toggle/delete a todo and assert each operation succeeds

### Implementation for User Story 4

- [ ] T029 [US4] Push `my-todo-app/` project to GitHub: `git init`, `git add .`, `git commit -m "feat: initial todo app"`, create remote repo, `git push -u origin main`
- [ ] T030 [US4] Deploy to Vercel: connect GitHub repo via vercel.com > Add New Project > Import Git Repository, add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) in Project Settings > Environment Variables, then Deploy
- [ ] T031 [US4] Run Playwright E2E against deployed URL: `PLAYWRIGHT_BASE_URL=https://[vercel-url] npx playwright test e2e/todo-deployed.spec.ts`

**Checkpoint**: US4 완료 — 배포 완료. Playwright E2E가 실제 배포 URL에서 PASS.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: UX 개선 및 엣지 케이스 처리

- [x] T032 [P] Add network error handling in `my-todo-app/app/page.tsx`: wrap supabase calls in try/catch, display error message to user (e.g., `<p className="text-red-500">오류가 발생했습니다</p>`) when fetch/insert/update/delete fails
- [x] T033 [P] Add loading state in `my-todo-app/app/page.tsx`: `useState` for `isLoading: boolean`, show loading indicator during initial fetch (`useEffect`), disable Add button while adding
- [x] T034 Handle long title display in `my-todo-app/app/page.tsx`: apply Tailwind `break-words` or `truncate` class to title element to prevent UI breakage for titles over 100 characters
- [ ] T035 [P] Write Jest unit test in `my-todo-app/__tests__/page.test.tsx`: test that Add button is disabled while loading, test that error message renders on supabase failure
- [ ] T036 Run all tests: `npm test` (Jest) and `npx playwright test` (Playwright) — confirm all PASS
- [ ] T037 Run quickstart.md validation: follow steps in `specs/001-todo-webapp/quickstart.md` to verify full setup flow works end-to-end

> **Note**: T009 (Supabase 테이블 생성), T029-T031 (GitHub 푸시 및 Vercel 배포)은 사용자가 직접 실행해야 합니다.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존성 없음 — 즉시 시작 가능
- **Foundational (Phase 2)**: Phase 1 완료 후 시작 — 모든 유저 스토리를 블로킹
- **User Stories (Phase 3–6)**: Phase 2 완료 후 시작 (순차 권장: P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: 원하는 유저 스토리 완료 후 진행

### User Story Dependencies

- **US1 (P1)**: Phase 2 완료 후 시작 — 다른 스토리와 독립
- **US2 (P2)**: US1 완료 권장 (같은 page.tsx 파일에 기능 추가)
- **US3 (P3)**: US1 완료 권장 (같은 page.tsx 파일에 기능 추가)
- **US4 (P4)**: US1~US3 로컬 기능 및 테스트 완료 후 진행

### Within Each User Story

- **테스트 먼저 작성 → FAIL 확인 → 구현 → PASS 확인** (TDD)
- 타입 정의 → 클라이언트 모듈 → 테스트 작성 → 구현 순서
- 각 스토리 완료 후 `npm test` + `npx playwright test` 실행

### Parallel Opportunities

- T003–T008 (Phase 1 테스트 도구 설정): 상호 독립적으로 병렬 실행 가능
- T010, T011 (Phase 2): 병렬 실행 가능 (각각 다른 파일)
- 각 스토리 내 테스트 태스크들 ([P] 표시): 병렬 작성 가능

---

## Parallel Example: Phase 3 테스트 작성

```bash
# US1 테스트 3개는 서로 다른 파일/시나리오이므로 병렬 작성 가능:
Task: "Jest unit test — todo list rendering (my-todo-app/__tests__/page.test.tsx)"
Task: "Jest unit test — addTodo validation (my-todo-app/__tests__/page.test.tsx)"
Task: "Playwright E2E — add and persist todo (my-todo-app/e2e/todo-add.spec.ts)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only — TDD)

1. Phase 1: Setup 완료 (Jest + Playwright 설정 포함)
2. Phase 2: Foundational 완료 (CRITICAL — 모든 스토리 블로킹)
3. Phase 3 테스트 작성 → FAIL 확인
4. Phase 3 구현 → PASS 확인
5. **STOP and VALIDATE**: `npm test` + `npx playwright test e2e/todo-add.spec.ts`
6. MVP 확인 후 다음 스토리 진행

### Incremental Delivery

1. Phase 1 + Phase 2 완료 → 기반 준비
2. Phase 3 (US1) → 테스트 작성 → 구현 → PASS → **MVP!**
3. Phase 4 (US2) → 테스트 작성 → 구현 → PASS
4. Phase 5 (US3) → 테스트 작성 → 구현 → PASS → **Full CRUD 완성!**
5. Phase 6 (US4) → Vercel 배포 → E2E on deployed URL → **공개 서비스!**
6. Phase 7 (Polish) → UX 개선 + 전체 테스트 PASS 확인

---

## Notes

- [P] 태스크 = 다른 파일, 의존성 없음 (병렬 실행 가능)
- [Story] 레이블은 해당 유저 스토리와 태스크를 연결하여 추적성 확보
- **TDD**: 각 스토리 테스트를 구현 전에 작성하고 FAIL을 먼저 확인할 것
- Jest 테스트는 supabase 모듈을 mock 처리 (실제 DB 연결 없음)
- Playwright E2E는 실제 DB에 연결 (로컬 `.env.local` 또는 배포 URL 사용)
- `.env.local`은 절대 git에 커밋하지 않음 (Supabase 키 포함)
- 각 태스크 또는 논리적 그룹 완료 후 git commit 권장
- 각 체크포인트에서 `npm test` + `npx playwright test` 실행하여 전체 테스트 PASS 확인
