import type { IrFilterRecord } from '@odooseek/odoo-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { FavoriteFilters } from '../FavoriteFilters'

const mockFilters: IrFilterRecord[] = [
  {
    id: 1,
    name: 'My Draft Leads',
    user_id: [1, 'admin'],
    domain: '[["state", "=", "draft"]]',
    context: {},
    sort: '',
    is_default: false,
  },
  {
    id: 2,
    name: 'Open Opportunities',
    user_id: [1, 'admin'],
    domain: '[["stage_id", "=", 2]]',
    context: { group_by: ['stage_id'] },
    sort: '',
    is_default: false,
  },
]

const mockSaveFilter = vi.fn()
const mockDeleteFilter = vi.fn()

vi.mock('../../hooks/useFavoriteFilters', () => ({
  useFavoriteFilters: () => ({
    filters: mockFilters,
    isLoading: false,
    saveFilter: (...args: unknown[]) => mockSaveFilter(...args),
    deleteFilter: (...args: unknown[]) => mockDeleteFilter(...args),
    isSaving: false,
    isDeleting: false,
  }),
}))

let queryClient: QueryClient

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('FavoriteFilters', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    vi.clearAllMocks()
  })

  test('renders star button', () => {
    render(
      <FavoriteFilters
        model="crm.lead"
        currentDomain={[]}
        currentGroupBys={[]}
        onApplyFilter={vi.fn()}
      />,
      { wrapper },
    )
    expect(screen.getByTitle('Favorite filters')).toBeInTheDocument()
  })

  test('opens dropdown and shows saved filters list', () => {
    render(
      <FavoriteFilters
        model="crm.lead"
        currentDomain={[]}
        currentGroupBys={[]}
        onApplyFilter={vi.fn()}
      />,
      { wrapper },
    )
    fireEvent.click(screen.getByTitle('Favorite filters'))
    expect(screen.getAllByText('Favorites').length).toBeGreaterThan(0)
    expect(screen.getByText('My Draft Leads')).toBeInTheDocument()
    expect(screen.getByText('Open Opportunities')).toBeInTheDocument()
  })

  test('clicking a filter calls onApplyFilter with correct domain', () => {
    const onApplyFilter = vi.fn()
    render(
      <FavoriteFilters
        model="crm.lead"
        currentDomain={[]}
        currentGroupBys={[]}
        onApplyFilter={onApplyFilter}
      />,
      { wrapper },
    )
    fireEvent.click(screen.getByTitle('Favorite filters'))
    fireEvent.click(screen.getByText('My Draft Leads'))
    expect(onApplyFilter).toHaveBeenCalledWith([['state', '=', 'draft']], [])
  })

  test('clicking a filter with group_by calls onApplyFilter correctly', () => {
    const onApplyFilter = vi.fn()
    render(
      <FavoriteFilters
        model="crm.lead"
        currentDomain={[]}
        currentGroupBys={[]}
        onApplyFilter={onApplyFilter}
      />,
      { wrapper },
    )
    fireEvent.click(screen.getByTitle('Favorite filters'))
    fireEvent.click(screen.getByText('Open Opportunities'))
    expect(onApplyFilter).toHaveBeenCalledWith([['stage_id', '=', 2]], ['stage_id'])
  })

  test('delete button triggers deleteFilter mutation', () => {
    render(
      <FavoriteFilters
        model="crm.lead"
        currentDomain={[]}
        currentGroupBys={[]}
        onApplyFilter={vi.fn()}
      />,
      { wrapper },
    )
    fireEvent.click(screen.getByTitle('Favorite filters'))
    const deleteButtons = screen.getAllByTitle('Delete filter')
    fireEvent.click(deleteButtons[0])
    expect(mockDeleteFilter).toHaveBeenCalledWith(1)
  })

  test('save button triggers saveFilter mutation', () => {
    render(
      <FavoriteFilters
        model="crm.lead"
        currentDomain={[['state', '=', 'draft']]}
        currentGroupBys={[]}
        onApplyFilter={vi.fn()}
      />,
      { wrapper },
    )
    fireEvent.click(screen.getByTitle('Favorite filters'))
    fireEvent.click(screen.getByText('Save current filter'))
    const input = screen.getByPlaceholderText('Filter name')
    fireEvent.change(input, { target: { value: 'Test Filter' } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)
    expect(mockSaveFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Filter',
        model_id: 'crm.lead',
        domain: [['state', '=', 'draft']],
      }),
    )
  })

  test('save form includes group_bys in context', () => {
    render(
      <FavoriteFilters
        model="crm.lead"
        currentDomain={[['state', '=', 'draft']]}
        currentGroupBys={['stage_id']}
        onApplyFilter={vi.fn()}
      />,
      { wrapper },
    )
    fireEvent.click(screen.getByTitle('Favorite filters'))
    fireEvent.click(screen.getByText('Save current filter'))
    const input = screen.getByPlaceholderText('Filter name')
    fireEvent.change(input, { target: { value: 'Grouped Filter' } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)
    expect(mockSaveFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Grouped Filter',
        context: { group_by: ['stage_id'] },
      }),
    )
  })
})
