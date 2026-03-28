import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'

// Mock lib/supabase
const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockOrder = jest.fn()
const mockEq = jest.fn()

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })),
  },
}))

const mockTodos = [
  {
    id: '1',
    title: '첫 번째 할 일',
    is_completed: false,
    created_at: '2026-03-28T00:00:00Z',
  },
  {
    id: '2',
    title: '완료된 할 일',
    is_completed: true,
    created_at: '2026-03-28T01:00:00Z',
  },
]

function setupSupabaseMocks() {
  mockOrder.mockResolvedValue({ data: mockTodos, error: null })
  mockSelect.mockReturnValue({ order: mockOrder })
  mockInsert.mockResolvedValue({ error: null })
  mockEq.mockResolvedValue({ error: null })
  mockUpdate.mockReturnValue({ eq: mockEq })
  mockDelete.mockReturnValue({ eq: mockEq })
}

beforeEach(() => {
  jest.clearAllMocks()
  setupSupabaseMocks()
})

// ============================================================
// US1: 할 일 추가 및 조회
// ============================================================

describe('US1: 할 일 추가 및 조회', () => {
  test('앱 로드 시 "나의 할 일" 제목이 표시된다', async () => {
    render(<Home />)
    expect(screen.getByText('나의 할 일')).toBeInTheDocument()
  })

  test('앱 로드 시 기존 할 일 목록을 불러와 표시한다', async () => {
    render(<Home />)
    await waitFor(() => {
      expect(screen.getByText('첫 번째 할 일')).toBeInTheDocument()
    })
  })

  test('텍스트 입력 후 추가 버튼 클릭 시 supabase insert가 호출된다', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const input = screen.getByPlaceholderText(/할 일을 입력/)
    const addButton = screen.getByRole('button', { name: /추가/ })

    await user.type(input, '새로운 할 일')
    await user.click(addButton)

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith([{ title: '새로운 할 일' }])
    })
  })

  test('빈 입력으로 추가 버튼 클릭 시 insert가 호출되지 않는다', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const addButton = screen.getByRole('button', { name: /추가/ })
    await user.click(addButton)

    expect(mockInsert).not.toHaveBeenCalled()
  })

  test('공백만 있는 입력으로 추가 버튼 클릭 시 insert가 호출되지 않는다', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const input = screen.getByPlaceholderText(/할 일을 입력/)
    await user.type(input, '   ')
    const addButton = screen.getByRole('button', { name: /추가/ })
    await user.click(addButton)

    expect(mockInsert).not.toHaveBeenCalled()
  })
})

// ============================================================
// US2: 할 일 완료 처리
// ============================================================

describe('US2: 할 일 완료 처리', () => {
  test('체크박스 클릭 시 supabase update가 호출된다', async () => {
    const user = userEvent.setup()
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('첫 번째 할 일')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ is_completed: true })
    })
  })

  test('완료된 할 일 체크박스 클릭 시 is_completed: false로 update 호출된다', async () => {
    const user = userEvent.setup()
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('완료된 할 일')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // 두 번째 항목 (완료 상태)

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ is_completed: false })
    })
  })

  test('완료된 할 일 제목에는 line-through 스타일이 적용된다', async () => {
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('완료된 할 일')).toBeInTheDocument()
    })

    const completedTitle = screen.getByText('완료된 할 일')
    expect(completedTitle.className).toMatch(/line-through/)
  })
})

// ============================================================
// US3: 할 일 삭제
// ============================================================

describe('US3: 할 일 삭제', () => {
  test('삭제 버튼 클릭 시 supabase delete가 올바른 id로 호출된다', async () => {
    const user = userEvent.setup()
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('첫 번째 할 일')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: /삭제/ })
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', '1')
    })
  })
})
