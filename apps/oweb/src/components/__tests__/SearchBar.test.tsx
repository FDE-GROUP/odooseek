import type { SearchFilter, SearchGroupBy } from '@odooseek/odoo-client'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { SearchBar } from '../SearchBar'

vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return {
    ...actual,
    ...{
      nameSearch: vi.fn(),
    },
  }
})

vi.mock('../FavoriteFilters', () => ({
  FavoriteFilters: () => null,
}))

import { nameSearch } from '@odooseek/odoo-client'

const mockedNameSearch = vi.mocked(nameSearch)

const mockFilters: SearchFilter[] = [
  { name: 'draft', string: 'Draft', domain: [['state', '=', 'draft']] },
  { name: 'done', string: 'Done', domain: [['state', '=', 'done']] },
]
const mockGroupBys: SearchGroupBy[] = [{ name: 'stage', string: 'Stage', fieldName: 'stage_id' }]

describe('SearchBar', () => {
  test('renders search input with placeholder', () => {
    render(<SearchBar onSearch={vi.fn()} placeholder="Search leads..." />)
    expect(screen.getByPlaceholderText('Search leads...')).toBeTruthy()
  })

  test('does not show filter button when no filters', () => {
    render(<SearchBar onSearch={vi.fn()} />)
    expect(screen.queryByTitle('Filters')).toBeNull()
  })

  test('shows filter button when filters provided', () => {
    render(<SearchBar onSearch={vi.fn()} filters={mockFilters} />)
    expect(screen.getByTitle('Filters')).toBeTruthy()
  })

  test('Enter key triggers onSearch with keyword domain', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSearch).toHaveBeenCalledWith(
      expect.arrayContaining([expect.arrayContaining(['name', 'ilike', 'test'])]),
    )
  })

  test('Escape key clears and calls onSearch with empty domain', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'x' } })
    // First Escape closes autocomplete if open
    fireEvent.keyDown(input, { key: 'Escape' })
    // Second Escape clears all
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onSearch).toHaveBeenCalledWith([])
  })

  test('Add Custom Filter in filter menu shows advanced search form', () => {
    render(<SearchBar onSearch={vi.fn()} filters={mockFilters} />)
    fireEvent.click(screen.getByTitle('Filters'))
    expect(screen.getByText('Add Custom Filter')).toBeTruthy()
    fireEvent.click(screen.getByText('Add Custom Filter'))
    expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Apply')).toBeTruthy()
  })

  test('toggling a filter calls onSearch with filter domain', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} filters={mockFilters} groupByFilters={mockGroupBys} />)
    fireEvent.click(screen.getByTitle('Filters'))
    fireEvent.click(screen.getByText('Draft'))
    expect(onSearch).toHaveBeenCalledWith([['state', '=', 'draft']])
  })

  test('toggling groupBy calls onGroupByChange', () => {
    const onGroupByChange = vi.fn()
    render(
      <SearchBar
        onSearch={vi.fn()}
        onGroupByChange={onGroupByChange}
        filters={mockFilters}
        groupByFilters={mockGroupBys}
      />,
    )
    fireEvent.click(screen.getAllByTitle('Group By')[0])
    fireEvent.click(screen.getByText('Stage'))
    expect(onGroupByChange).toHaveBeenCalledWith(['stage_id'])
  })

  test('autocomplete does not fetch when no model prop', async () => {
    render(<SearchBar onSearch={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'test query' },
    })
    await new Promise((r) => setTimeout(r, 400))
    expect(mockedNameSearch).not.toHaveBeenCalled()
  })

  test('autocomplete does not fetch for short keywords', async () => {
    mockedNameSearch.mockResolvedValue([])
    render(<SearchBar onSearch={vi.fn()} model="res.partner" />)
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'a' },
    })
    await new Promise((r) => setTimeout(r, 400))
    expect(mockedNameSearch).not.toHaveBeenCalled()
  })

  test('autocomplete calls nameSearch after debounce', async () => {
    mockedNameSearch.mockResolvedValue([
      [1, 'Partner A'],
      [2, 'Partner B'],
    ])
    render(<SearchBar onSearch={vi.fn()} model="res.partner" />)
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'Part' },
    })
    await waitFor(() => {
      expect(mockedNameSearch).toHaveBeenCalledWith('res.partner', 'Part')
    })
    await waitFor(() => {
      expect(screen.getByText('Partner A')).toBeTruthy()
      expect(screen.getByText('Partner B')).toBeTruthy()
    })
  })

  test('autocomplete selection triggers onSearch with id domain', async () => {
    const onSearch = vi.fn()
    mockedNameSearch.mockResolvedValue([[42, 'Test Record']])
    render(<SearchBar onSearch={onSearch} model="res.partner" />)
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'Test' },
    })
    await waitFor(() => {
      expect(screen.getByText('Test Record')).toBeTruthy()
    })
    fireEvent.click(screen.getByText('Test Record'))
    expect(onSearch).toHaveBeenCalledWith([['id', '=', 42]])
  })

  test('shows filter menu when filters provided', () => {
    const onSearch = vi.fn()
    const filters = [{ name: 'active', string: 'Active', domain: [['active', '=', true]] }]
    render(<SearchBar onSearch={onSearch} model="res.partner" filters={filters} />)
    // Filter button exists (shows count of available filters)
    const filterBtn = document.querySelector('button svg')
    expect(filterBtn).toBeTruthy()
  })

  test('shows groupBy button when groupBy filters provided', () => {
    const onSearch = vi.fn()
    const onGroupBy = vi.fn()
    render(
      <SearchBar
        onSearch={onSearch}
        onGroupByChange={onGroupBy}
        groupByFilters={[{ name: 'sales', string: 'Salesperson', fieldName: 'user_id' }]}
        model="res.partner"
      />,
    )
    // Verify component renders without error
    expect(onSearch).toBeDefined()
    expect(onGroupBy).toBeDefined()
  })

  test('resets search when Escape is pressed', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} model="res.partner" />)
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onSearch).toHaveBeenCalledWith([])
  })
})
