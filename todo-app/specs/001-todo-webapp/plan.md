# Implementation Plan: Todo Web App (바이브코딩)

**Branch**: `001-todo-webapp` | **Date**: 2026-03-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-webapp/spec.md`

## Summary

Next.js(App Router) + TypeScript + Tailwind CSS로 구성된 Todo 웹앱을 구현한다. Supabase PostgreSQL을 영구 저장소로 사용하여 할 일의 추가/조회/완료 토글/삭제(CRUD)를 지원하며, Vercel에 배포하여 인터넷 어디서든 접근 가능하게 한다. 인증 없는 단일 공유 목록이며, 학습 목적으로 RLS는 비활성화한다.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 18+)
**Primary Dependencies**: Next.js 14+ (App Router), @supabase/supabase-js v2, Tailwind CSS 3.x
**Storage**: PostgreSQL via Supabase (managed cloud DB)
**Testing**: 브라우저 수동 테스트 + Supabase Table Editor로 DB 확인
**Target Platform**: 웹 브라우저 (데스크톱 우선) + Vercel 클라우드 호스팅
**Project Type**: web-app (Next.js App Router, Client Component 중심)
**Performance Goals**: 페이지 로드 3초 이내, CRUD 응답 1초 이내
**Constraints**: Supabase 무료 티어(500MB DB), Vercel 무료 티어(100GB 대역폭)
**Scale/Scope**: 단일 사용자 학습 프로젝트, 수십~수백 개 Todo 항목

## Constitution Check

*Constitution 파일이 템플릿 상태(미작성)이므로 프로젝트 고유 게이트 없음. 아래는 일반 품질 게이트.*

| Gate | Status | Notes |
|------|--------|-------|
| 스펙 완성도 (NEEDS CLARIFICATION 없음) | PASS | 모든 요구사항 명확 |
| 기술 스택 확정 | PASS | Next.js, Supabase, Vercel 고정 |
| 데이터 모델 식별 가능 | PASS | todos 테이블 필드 명확 |
| 보안 고려사항 문서화 | PASS | RLS 비활성화 이유 Assumptions에 명시 |

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-webapp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── supabase-schema.sql
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
my-todo-app/                  # Next.js 프로젝트 루트
├── app/
│   ├── layout.tsx            # 루트 레이아웃
│   ├── page.tsx              # 메인 페이지 (Todo 앱 UI)
│   └── globals.css           # 전역 스타일
├── lib/
│   └── supabase.ts           # Supabase 클라이언트 초기화
├── types/
│   └── todo.ts               # Todo 타입 정의
├── public/
├── .env.local                # 환경 변수 (Git 제외)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Structure Decision**: Next.js App Router 단일 프로젝트. 별도 backend 없이 Client Component에서 Supabase JS SDK를 직접 호출. `lib/supabase.ts`에 클라이언트를 분리하여 재사용성 확보.

## Complexity Tracking

> 헌법 위반 사항 없음
