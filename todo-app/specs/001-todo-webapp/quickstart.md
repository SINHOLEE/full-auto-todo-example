# Quickstart: Todo Web App

**Feature**: 001-todo-webapp | **Date**: 2026-03-28

## 사전 요구사항

- Node.js 18+
- Supabase 계정 + 프로젝트 생성 완료
- Supabase MCP 설정 및 인증 완료
- GitHub 계정
- Vercel 계정

## 1. 프로젝트 생성

```bash
npx create-next-app@latest my-todo-app \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd my-todo-app
```

## 2. Supabase 패키지 설치

```bash
npm install @supabase/supabase-js
```

## 3. Supabase 테이블 생성 (MCP 사용)

Claude에게 요청:
```
Supabase에 todos 테이블을 만들어줘.
필드: id(uuid, PK, 자동생성), title(text, 필수), is_completed(boolean, 기본값 false), created_at(timestamptz, 자동생성)
RLS는 비활성화해줘.
```

또는 `contracts/supabase-schema.sql` SQL을 Supabase SQL Editor에서 직접 실행.

## 4. 환경 변수 설정

`.env.local` 파일 생성:
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
```

값 확인: Supabase 대시보드 > Project overview > Project URL / Publishable key

## 5. Supabase 클라이언트 생성

`lib/supabase.ts` 파일 생성:
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)
```

## 6. Todo 타입 정의

`types/todo.ts` 파일 생성:
```typescript
export interface Todo {
  id: string
  title: string
  is_completed: boolean
  created_at: string
}
```

## 7. 메인 페이지 구현

`app/page.tsx`에 다음 기능 구현:
- 할 일 목록 로드 (`SELECT * FROM todos ORDER BY created_at DESC`)
- 할 일 추가 (`INSERT INTO todos (title)`)
- 완료 토글 (`UPDATE todos SET is_completed WHERE id`)
- 할 일 삭제 (`DELETE FROM todos WHERE id`)

## 8. 로컬 개발 서버 실행

```bash
npm run dev
```
→ http://localhost:3000 접속

## 9. GitHub 푸시

```bash
git init
git add .
git commit -m "feat: initial todo app"
git remote add origin https://github.com/[username]/my-todo-app.git
git push -u origin main
```

## 10. Vercel 배포

1. vercel.com > Add New Project > Import Git Repository
2. Environment Variables 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Deploy 클릭

## 주요 파일 구조

```
my-todo-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx        ← Todo 앱 메인 UI
│   └── globals.css
├── lib/
│   └── supabase.ts     ← Supabase 클라이언트
├── types/
│   └── todo.ts         ← Todo 타입
└── .env.local          ← 환경 변수 (Git 제외)
```
