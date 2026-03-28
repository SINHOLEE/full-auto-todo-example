-- Supabase todos 테이블 스키마
-- Feature: 001-todo-webapp
-- Date: 2026-03-28

CREATE TABLE IF NOT EXISTS todos (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  is_completed boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 학습 목적: RLS 비활성화
-- ⚠️ 실서비스 전환 시 반드시 RLS 활성화 및 정책 설정 필요
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
