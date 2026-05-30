import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { OdooViewSwitcher } from '../OdooViewSwitcher'

vi.mock('@/lib/lucide-icons', () => ({
  Table: (_p: Record<string, unknown>) => <span>Table</span>,
  BarChart3: (_p: Record<string, unknown>) => <span>BarChart3</span>,
  CalendarDays: (_p: Record<string, unknown>) => <span>CalendarDays</span>,
  Columns3: (_p: Record<string, unknown>) => <span>Columns3</span>,
  LayoutList: (_p: Record<string, unknown>) => <span>LayoutList</span>,
  TrendingUp: (_p: Record<string, unknown>) => <span>TrendingUp</span>,
}))

describe('OdooViewSwitcher', () => {
  test('renders all view buttons', () => {
    render(<OdooViewSwitcher currentView="list" onSwitch={vi.fn()} />)
    expect(screen.getByText('List')).toBeInTheDocument()
    expect(screen.getByText('Calendar')).toBeInTheDocument()
    expect(screen.getByText('Pivot')).toBeInTheDocument()
    expect(screen.getByText('Graph')).toBeInTheDocument()
    expect(screen.getByText('Kanban')).toBeInTheDocument()
    expect(screen.queryByText('Form')).not.toBeInTheDocument()
  })

  test('highlights current view', () => {
    render(<OdooViewSwitcher currentView="kanban" onSwitch={vi.fn()} />)
    const kanbanBtn = screen.getByText('Kanban').closest('button') as HTMLButtonElement
    expect(kanbanBtn.className).toContain('bg-accent')
  })

  test('clicking button triggers onSwitch', async () => {
    const user = userEvent.setup()
    const onSwitch = vi.fn()
    render(<OdooViewSwitcher currentView="list" onSwitch={onSwitch} />)
    await user.click(screen.getByText('Kanban'))
    expect(onSwitch).toHaveBeenCalledWith('kanban')
  })
})
