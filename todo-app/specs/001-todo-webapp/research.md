# Research: Todo Web App

**Phase**: 0 | **Date**: 2026-03-28 | **Feature**: 001-todo-webapp

## 1. Next.js App Router vs Pages Router

**Decision**: App Router 사용
**Rationale**: 과제 명세에서 App Router 사용을 명시. Next.js 14+의 기본 방식이며 `app/page.tsx`가 메인 진입점.
**Alternatives considered**: Pages Router (`pages/index.tsx`) — 구 방식이나 과제 요구사항에 맞지 않음.

---

## 2. Supabase 클라이언트 패턴

**Decision**: `@supabase/supabase-js` v2 브라우저 클라이언트 사용 (`createClient`)
**Rationale**: 가장 단순한 패턴. Next.js App Router에서 Client Component(`'use client'`)에서 직접 호출. 인증 없는 공개 접근이므로 서버 사이드 클라이언트 불필요.
**Alternatives considered**:
- `@supabase/ssr` 패키지 — 서버 컴포넌트/SSR용, 인증이 필요할 때 적합. 현재 범위 초과.
- Server Actions — 추가 복잡도, 학습 목적 프로젝트에 불필요.

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)
```

---

## 3. 데이터 페칭 및 상태 관리 패턴

**Decision**: `useState` + `useEffect`로 클라이언트 사이드 페칭
**Rationale**: 단순한 단일 페이지 앱에 가장 적합. 추가적인 상태 관리 라이브러리(Redux, Zustand 등) 불필요.
**Alternatives considered**:
- React Query / SWR — 캐싱, 재시도 등 고급 기능. 현재 규모에 과도함.
- Server Component fetch — 인증 없는 실시간 인터랙션에 부적합.

---

## 4. 환경 변수 키 이름

**Decision**: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
**Rationale**: 2025년 11월 이후 생성된 Supabase 프로젝트는 `sb_publishable_...` 형식의 새 키 사용. 과제 명세에서 `PUBLISHABLE_KEY` 또는 `ANON_KEY` 둘 다 언급. 신규 프로젝트 기준으로 `PUBLISHABLE_KEY` 우선 사용, 구 프로젝트라면 `ANON_KEY`로 대체.
**Alternatives considered**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` — 구 프로젝트 호환용.

---

## 5. UI 컴포넌트 구조

**Decision**: `app/page.tsx` 단일 Client Component에 Todo 앱 전체 UI 구현
**Rationale**: 단순 학습 프로젝트로 컴포넌트 분리의 실익이 적음. 한 파일에서 전체 흐름을 파악하기 쉬움.
**Alternatives considered**: TodoItem, TodoInput 등 별도 컴포넌트 분리 — 규모가 커질 경우 적합하나 현재는 과도한 추상화.

---

## 6. 배포 환경 변수

**Decision**: Vercel 대시보드 > Project Settings > Environment Variables에서 직접 설정
**Rationale**: Vercel MCP는 환경 변수 설정을 지원하지 않음(과제 명세 명시). 대시보드에서 수동 입력 필요.
**Alternatives considered**: Vercel CLI — 가능하나 대시보드가 더 직관적.

---

## 7. Todos 정렬 방식

**Decision**: `created_at` 기준 내림차순 (`order('created_at', { ascending: false })`)
**Rationale**: 최신 항목이 상단에 표시되어 사용자가 방금 추가한 할 일을 바로 확인 가능.
**Alternatives considered**: 오름차순 — 추가 순서대로 표시되나 스크롤이 필요할 수 있음.
