# Data Model: Todo Web App

**Phase**: 1 | **Date**: 2026-03-28 | **Feature**: 001-todo-webapp

## Entity: Todo

할 일 항목 하나를 나타내는 핵심 엔티티.

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | uuid | PK, auto-generated (`gen_random_uuid()`) | 고유 식별자 |
| `title` | text | NOT NULL, 공백 불가 | 할 일 내용 |
| `is_completed` | boolean | NOT NULL, DEFAULT false | 완료 여부 |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | 생성 시각 |

### Validation Rules

- `title`: 빈 문자열(`''`) 및 공백만 있는 문자열 불가 — 앱 레벨에서 `trim()` 후 길이 검증
- `id`: 자동 생성, 클라이언트에서 설정 불필요
- `created_at`: 자동 생성, 클라이언트에서 설정 불필요

### State Transitions

```
미완료 (is_completed: false)
    ↕ 체크박스 클릭
완료 (is_completed: true)
```

### TypeScript 타입

```typescript
// types/todo.ts
export interface Todo {
  id: string
  title: string
  is_completed: boolean
  created_at: string
}
```

## 데이터베이스 설계 결정

- **RLS 비활성화**: 학습 목적으로 Row Level Security 비활성화. 실서비스 전환 시 반드시 활성화 필요.
- **단일 테이블**: 사용자 구분 없는 공유 목록이므로 user_id 컬럼 불필요.
- **소프트 삭제 없음**: 삭제 시 실제 레코드 삭제 (`DELETE`). 복구 기능 범위 외.
- **정렬**: `created_at DESC` (최신 항목 상단)
