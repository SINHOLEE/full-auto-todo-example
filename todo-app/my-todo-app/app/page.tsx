'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Todo } from '@/types/todo'

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchTodos() {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select()
        .order('created_at', { ascending: false })
      if (error) throw error
      setTodos(data ?? [])
    } catch {
      setError('할 일 목록을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  async function addTodo() {
    const title = newTitle.trim()
    if (!title || isSubmitting) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('todos').insert([{ title }])
      if (error) throw error
      setNewTitle('')
      await fetchTodos()
    } catch {
      setError('할 일을 추가하지 못했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function toggleTodo(id: string, is_completed: boolean) {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_completed: !is_completed })
        .eq('id', id)
      if (error) throw error
      await fetchTodos()
    } catch {
      setError('상태를 변경하지 못했습니다.')
    }
  }

  async function deleteTodo(id: string) {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id)
      if (error) throw error
      await fetchTodos()
    } catch {
      setError('할 일을 삭제하지 못했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">나의 할 일</h1>

        {error && (
          <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="할 일을 입력하세요"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
          />
          <button
            onClick={addTodo}
            disabled={isLoading || isSubmitting}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            추가
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-gray-400">불러오는 중...</p>
        ) : todos.length === 0 ? (
          <p className="text-center text-sm text-gray-400">할 일이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3"
              >
                <input
                  type="checkbox"
                  checked={todo.is_completed}
                  onChange={() => toggleTodo(todo.id, todo.is_completed)}
                  className="h-4 w-4 cursor-pointer accent-blue-500"
                />
                <span
                  className={`flex-1 break-words text-sm ${
                    todo.is_completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-700'
                  }`}
                >
                  {todo.title}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="ml-2 text-xs text-red-400 hover:text-red-600"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
