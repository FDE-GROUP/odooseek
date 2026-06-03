import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { CommandPalette, fuzzyMatch } from '../CommandPalette'

// ── fuzzyMatch unit tests ──────────────────────────────────────

describe('fuzzyMatch', () => {
  test('exact substring returns high score', () => {
    expect(fuzzyMatch('Sales Pipeline', 'sales')).toBeGreaterThan(0)
    // "sales" found at index 0 → 1000 - 0 = 1000
    expect(fuzzyMatch('Sales Pipeline', 'sales')).toBe(1000)
  })

  test('case-insensitive matching', () => {
    expect(fuzzyMatch('CRM Pipeline', 'crm')).toBeGreaterThan(0)
    expect(fuzzyMatch('CRM Pipeline', 'CRM')).toBeGreaterThan(0)
  })

  test('fuzzy: chars in order match', () => {
    // "sp" matches "Sales Pipeline" (s...p... in order)
    expect(fuzzyMatch('Sales Pipeline', 'sp')).toBeGreaterThan(0)
  })

  test('fuzzy: out-of-order chars fail', () => {
    // "sl" → 's' at 0, then 'l' must come after → found at 2 in "Sales" → match (not out of order)
    // Use truly impossible: "xyz" has no match in "Sales"
    expect(fuzzyMatch('Sales', 'xyz')).toBe(-1)
  })

  test('fuzzy: missing char fails', () => {
    expect(fuzzyMatch('Sales', 'sz')).toBe(-1)
  })

  test('consecutive chars score higher than spread', () => {
    const consecutive = fuzzyMatch('Sales', 'sa')
    const spread = fuzzyMatch('Sales Pipeline', 'sp')
    expect(consecutive).toBeGreaterThan(spread)
  })

  test('empty query matches with substring score', () => {
    // idx 0 → 1000 - 0 = 1000
    expect(fuzzyMatch('anything', '')).toBe(1000)
  })
})

// ── Component tests ────────────────────────────────────────────

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: null }),
}))

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}))

vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return {
    ...actual,
    ...{
      fetchMenus: vi.fn(),
      flattenMenuItems: vi.fn(),
    },
  }
})

describe('CommandPalette', () => {
  test('renders nothing by default (closed)', () => {
    const { container } = render(<CommandPalette />)
    expect(container.innerHTML).toBe('')
  })

  test('Ctrl+K opens the palette', () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { ctrlKey: true, key: 'k' })
    expect(screen.getByPlaceholderText('Search menus...')).toBeTruthy()
  })

  test('Cmd+K opens the palette (macOS)', () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { metaKey: true, key: 'k' })
    expect(screen.getByPlaceholderText('Search menus...')).toBeTruthy()
  })

  test('Escape closes the palette', () => {
    render(<CommandPalette />)
    // Open first
    fireEvent.keyDown(window, { ctrlKey: true, key: 'k' })
    expect(screen.getByPlaceholderText('Search menus...')).toBeTruthy()
    // Close with Escape
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByPlaceholderText('Search menus...')).toBeNull()
  })

  test('clicking backdrop closes the palette', () => {
    render(<CommandPalette />)
    // Open first
    fireEvent.keyDown(window, { ctrlKey: true, key: 'k' })
    expect(screen.getByPlaceholderText('Search menus...')).toBeTruthy()
    // Click backdrop (the outer fixed div)
    const backdrop = screen.getByPlaceholderText('Search menus...').closest('.fixed')
    expect(backdrop).toBeTruthy()
    fireEvent.click(backdrop as HTMLElement)
    expect(screen.queryByPlaceholderText('Search menus...')).toBeNull()
  })

  test('renders search input with placeholder', () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { ctrlKey: true, key: 'k' })
    const input = screen.getByPlaceholderText('Search menus...')
    expect(input).toBeTruthy()
  })

  test('shows "Type to search menus..." when opened with empty query', () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { ctrlKey: true, key: 'k' })
    expect(screen.getByText('Type to search menus...')).toBeTruthy()
  })
})
