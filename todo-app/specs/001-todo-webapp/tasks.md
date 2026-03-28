# Tasks: Todo Web App (바이브코딩)

**Input**: Design documents from `/specs/001-todo-webapp/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/supabase-schema.sql ✅, quickstart.md ✅

**Tests**: 브라우저 수동 테스트 방식 (spec.md에 자동화 테스트 요청 없음 — 테스트 태스크 미포함)

**Organization**: 유저 스토리별로 태스크를 그룹화하여 각 스토리를 독립적으로 구현 및 테스트 가능하게 구성.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[Story]**: 해당 유저 스토리 레이블 (US1~US4)
- 각 태스크에 정확한 파일 경로 포함

---

## Phase 1: Setup (프로젝트 초기화)

**Purpose**: Next.js 프로젝트 생성 및 기본 구조 설정

- [ ] T001 Create Next.js project using `npx create-next-app@latest my-todo-app --typescript --tailwind --app --no-src-dir --import-alias "@/*"` in `/Users/siny/WebstormProjects/full-auto-todo-example/todo-app/`
- [ ] T002 Install Supabase client dependency: `npm install @supabase/supabase-js` in `my-todo-app/`
- [ ] T003 [P] Create `.env.local` in `my-todo-app/.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` placeholders
- [ ] T004 [P] Add `.env.local` to `my-todo-app/.gitignore` (verify it's excluded from git)

---

## Phase 2: Foundational (블로킹 전제조건)

**Purpose**: 모든 유저 스토리 구현 전에 완료되어야 할 핵심 인프라

**⚠️ CRITICAL**: 이 페이즈가 완료되어야 유저 스토리 구현 시작 가능

- [ ] T005 Create Supabase `todos` table by executing `specs/001-todo-webapp/contracts/supabase-schema.sql` via Supabase MCP or Supabase SQL Editor (schema: id uuid PK, title text NOT NULL, is_completed boolean DEFAULT false, created_at timestamptz DEFAULT now(); RLS disabled)
- [ ] T006 [P] Create Supabase client module in `my-todo-app/lib/supabase.ts` using `createClient` from `@supabase/supabase-js` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` env vars
- [ ] T007 [P] Create Todo TypeScript interface in `my-todo-app/types/todo.ts` with fields: `id: string`, `title: string`, `is_completed: boolean`, `created_at: string`

**Checkpoint**: Foundation ready — Supabase DB 테이블 생성 완료, 클라이언트 모듈 및 타입 정의 완료. 유저 스토리 구현 시작 가능.

---

## Phase 3: User Story 1 - 할 일 추가 및 조회 (Priority: P1) 🎯 MVP

**Goal**: 사용자가 할 일을 입력·추가하고, 앱 로드 시 목록을 불러와 표시. 새로고침 후에도 데이터 유지.

**Independent Test**: 입력창에 텍스트 입력 후 추가 버튼 클릭 → 목록에 항목 표시 → 페이지 새로고침 → 항목 여전히 표시. 빈 입력으로 추가 시 목록에 항목 미추가 확인.

### Implementation for User Story 1

- [ ] T008 [US1] Implement main page in `my-todo-app/app/page.tsx` as Client Component (`'use client'`) with: useState for `todos: Todo[]` and `newTitle: string`, useEffect to fetch todos on mount (`SELECT * FROM todos ORDER BY created_at DESC` via supabase), `addTodo` function (trim validation + INSERT + refetch), input field bound to `newTitle`, Add button that calls `addTodo`, and rendered todo list showing each item's title
- [ ] T009 [US1] Add empty input validation in `my-todo-app/app/page.tsx`: `addTodo` must call `title.trim()` and return early if empty (FR-006)
- [ ] T010 [US1] Style the page in `my-todo-app/app/page.tsx` using Tailwind CSS: "나의 할 일" heading, styled text input and Add button, todo list with each item displayed cleanly (FR-007)

**Checkpoint**: US1 완료 — 할 일 추가 및 조회 기능 동작. 브라우저에서 `http://localhost:3000` 접속하여 독립 테스트 가능.

---

## Phase 4: User Story 2 - 할 일 완료 처리 (Priority: P2)

**Goal**: 각 할 일 항목의 체크박스 클릭으로 완료 상태 토글. 완료 항목 시각적 구분. 새로고침 후에도 상태 유지.

**Independent Test**: 미완료 항목 체크박스 클릭 → 완료 스타일(취소선 등) 적용 → 새로고침 → 완료 상태 유지. 완료 항목 체크박스 다시 클릭 → 미완료 상태로 복원 확인.

### Implementation for User Story 2

- [ ] T011 [US2] Add `toggleTodo` function in `my-todo-app/app/page.tsx`: takes todo `id` and current `is_completed`, runs `UPDATE todos SET is_completed = !is_completed WHERE id = :id` via supabase, then refetches todos list
- [ ] T012 [US2] Add checkbox UI to each todo item in `my-todo-app/app/page.tsx`: `<input type="checkbox">` bound to `is_completed`, `onChange` calls `toggleTodo(todo.id, todo.is_completed)`
- [ ] T013 [US2] Add visual distinction for completed todos in `my-todo-app/app/page.tsx` using Tailwind CSS: apply `line-through` and `text-gray-400` (or similar) to title text when `is_completed` is true

**Checkpoint**: US2 완료 — 완료 토글 기능 동작. 체크박스 클릭 및 새로고침으로 독립 테스트 가능.

---

## Phase 5: User Story 3 - 할 일 삭제 (Priority: P3)

**Goal**: 각 할 일 항목의 삭제 버튼 클릭으로 항목 영구 삭제. 새로고침 후에도 삭제 상태 유지.

**Independent Test**: 목록에서 특정 항목 삭제 버튼 클릭 → 항목이 즉시 목록에서 사라짐 → 새로고침 → 항목이 다시 나타나지 않음 확인.

### Implementation for User Story 3

- [ ] T014 [US3] Add `deleteTodo` function in `my-todo-app/app/page.tsx`: takes todo `id`, runs `DELETE FROM todos WHERE id = :id` via supabase, then refetches todos list
- [ ] T015 [US3] Add delete button UI to each todo item in `my-todo-app/app/page.tsx`: `<button>` with delete label (e.g., "삭제" or "✕"), `onClick` calls `deleteTodo(todo.id)`, styled with Tailwind CSS

**Checkpoint**: US3 완료 — 삭제 기능 동작. 전체 CRUD 기능 로컬에서 브라우저 수동 테스트로 검증 가능.

---

## Phase 6: User Story 4 - 인터넷을 통한 앱 접근 (Priority: P4)

**Goal**: 앱을 Vercel에 배포하여 인터넷 어디서든 접근 가능하게 함. 배포 환경에서도 모든 CRUD 기능 정상 동작.

**Independent Test**: 배포된 Vercel URL로 접속 → 앱 정상 로드 → 할 일 추가/완료/삭제가 데이터베이스와 연동되어 정상 동작 확인.

### Implementation for User Story 4

- [ ] T016 [US4] Push `my-todo-app/` project to GitHub: `git init`, `git add .`, `git commit -m "feat: initial todo app"`, create remote repo, `git push -u origin main`
- [ ] T017 [US4] Deploy to Vercel: connect GitHub repo via vercel.com > Add New Project > Import Git Repository, add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) in Project Settings > Environment Variables, then Deploy
- [ ] T018 [US4] Verify deployed app at Vercel-provided URL: test add, toggle complete, and delete todo operations; confirm data persists after page refresh

**Checkpoint**: US4 완료 — 배포 완료. 공개 URL로 전체 기능 동작 확인.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: UX 개선 및 엣지 케이스 처리

- [ ] T019 [P] Add network error handling in `my-todo-app/app/page.tsx`: wrap supabase calls in try/catch, display error message to user (e.g., `<p className="text-red-500">오류가 발생했습니다</p>`) when fetch/insert/update/delete fails
- [ ] T020 [P] Add loading state in `my-todo-app/app/page.tsx`: `useState` for `isLoading: boolean`, show loading indicator during initial fetch (`useEffect`), disable Add button while adding
- [ ] T021 Handle long title display in `my-todo-app/app/page.tsx`: apply Tailwind `break-words` or `truncate` class to title element to prevent UI breakage for titles over 100 characters
- [ ] T022 Run quickstart.md validation: follow steps in `specs/001-todo-webapp/quickstart.md` to verify full setup flow works end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존성 없음 — 즉시 시작 가능
- **Foundational (Phase 2)**: Phase 1 완료 후 시작 — 모든 유저 스토리를 블로킹
- **User Stories (Phase 3–6)**: Phase 2 완료 후 시작 (순차 권장: P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: 원하는 유저 스토리 완료 후 진행

### User Story Dependencies

- **US1 (P1)**: Phase 2 완료 후 시작 — 다른 스토리와 독립
- **US2 (P2)**: Phase 2 완료 후 시작, US1 UI 위에 기능 추가 (US1 완료 권장)
- **US3 (P3)**: Phase 2 완료 후 시작, US1 UI 위에 기능 추가 (US1 완료 권장)
- **US4 (P4)**: US1~US3 로컬 기능 완료 후 진행

### Within Each User Story

- 타입 정의 → 클라이언트 모듈 → UI + 로직 순서
- 각 스토리 완료 후 브라우저에서 독립 테스트

### Parallel Opportunities

- T003, T004 (Phase 1): 병렬 실행 가능
- T006, T007 (Phase 2): 병렬 실행 가능 (각각 다른 파일)
- T019, T020 (Phase 7): 병렬 실행 가능

---

## Parallel Example: Phase 2 (Foundational)

```bash
# T006과 T007은 서로 다른 파일이므로 병렬 실행 가능:
Task: "Create Supabase client in my-todo-app/lib/supabase.ts"
Task: "Create Todo interface in my-todo-app/types/todo.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup 완료
2. Phase 2: Foundational 완료 (CRITICAL — 모든 스토리 블로킹)
3. Phase 3: User Story 1 완료
4. **STOP and VALIDATE**: `http://localhost:3000`에서 추가 및 조회 테스트
5. MVP 확인 후 다음 스토리 진행

### Incremental Delivery

1. Phase 1 + Phase 2 완료 → 기반 준비
2. Phase 3 (US1) → 브라우저 테스트 → **MVP!**
3. Phase 4 (US2) → 완료 토글 테스트
4. Phase 5 (US3) → 삭제 테스트 → **Full CRUD 완성!**
5. Phase 6 (US4) → Vercel 배포 → **공개 서비스!**
6. Phase 7 (Polish) → UX 개선

---

## Notes

- [P] 태스크 = 다른 파일, 의존성 없음 (병렬 실행 가능)
- [Story] 레이블은 해당 유저 스토리와 태스크를 연결하여 추적성 확보
- 각 유저 스토리는 독립적으로 완료 및 테스트 가능
- `.env.local`은 절대 git에 커밋하지 않음 (Supabase 키 포함)
- 각 태스크 또는 논리적 그룹 완료 후 git commit 권장
- 각 체크포인트에서 독립적으로 스토리 검증 후 다음 단계 진행
