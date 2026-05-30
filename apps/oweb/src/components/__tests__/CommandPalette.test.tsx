import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { CommandPalette } from '../CommandPalette'

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

vi.mock('../../lib/menu-service', () => ({
  fetchMenus: vi.fn(),
  flattenMenuItems: vi.fn(),
}))

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
