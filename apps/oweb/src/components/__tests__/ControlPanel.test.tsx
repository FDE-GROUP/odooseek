import type { ViewToolbar } from '@odooseek/odoo-client'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { ControlPanel } from '../ControlPanel'

vi.mock('@/lib/lucide-icons', () => ({
  ChevronDown: () => <span>v</span>,
  Filter: () => <span>f</span>,
  Plus: () => <span>+</span>,
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

// Mock child components to simplify testing
vi.mock('../Breadcrumbs', () => ({
  Breadcrumbs: ({ model, viewType }: { model: string; viewType: string }) => (
    <div data-testid="breadcrumbs">
      {model} / {viewType}
    </div>
  ),
}))

vi.mock('../Pagination', () => ({
  Pagination: ({ offset, total, limit }: { offset: number; total: number; limit: number }) => (
    <div data-testid="pagination">
      {offset}-{limit} / {total}
    </div>
  ),
}))

vi.mock('../SearchBar', () => ({
  SearchBar: ({ placeholder }: { placeholder?: string }) => (
    <div data-testid="searchbar">{placeholder ?? 'Search...'}</div>
  ),
}))

vi.mock('../../views/OdooViewSwitcher', () => ({
  OdooViewSwitcher: ({ currentView }: { currentView: string }) => (
    <div data-testid="view-switcher">{currentView}</div>
  ),
}))

const toolbarWithPrint: ViewToolbar = {
  print: [
    { id: 1, name: 'Invoice PDF', binding_view_types: 'list,form' },
    { id: 2, name: 'Delivery Slip', binding_view_types: 'form' },
  ],
  action: [],
}

const toolbarWithAction: ViewToolbar = {
  print: [],
  action: [
    { id: 10, name: 'Export', binding_view_types: 'list' },
    { id: 11, name: 'Merge', binding_view_types: 'list,kanban' },
  ],
}

const toolbarWithBoth: ViewToolbar = {
  print: [{ id: 1, name: 'Invoice PDF' }],
  action: [{ id: 10, name: 'Export' }],
}

describe('ControlPanel', () => {
  // ── Breadcrumbs ──────────────────────────────────────────
  test('renders breadcrumbs when given', () => {
    render(
      <ControlPanel
        breadcrumbs={{ model: 'sale.order', viewType: 'list', viewTitle: 'Sales Orders' }}
      />,
    )
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    expect(screen.getByText('sale.order / list')).toBeInTheDocument()
  })

  // ── Search bar ───────────────────────────────────────────
  test('renders search bar when visible=true', () => {
    render(
      <ControlPanel
        searchProps={{
          visible: true,
          onSearch: vi.fn(),
          placeholder: 'Search sale.order...',
        }}
      />,
    )
    expect(screen.getByTestId('searchbar')).toBeInTheDocument()
    expect(screen.getByText('Search sale.order...')).toBeInTheDocument()
  })

  test('hides search bar when visible=false', () => {
    render(<ControlPanel searchProps={{ visible: false, onSearch: vi.fn() }} />)
    expect(screen.queryByTestId('searchbar')).not.toBeInTheDocument()
  })

  // ── Pager ────────────────────────────────────────────────
  test('renders pager when visible=true', () => {
    render(
      <ControlPanel
        pagerProps={{
          visible: true,
          offset: 0,
          total: 120,
          limit: 40,
          onPageChange: vi.fn(),
          onLimitChange: vi.fn(),
        }}
      />,
    )
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
    expect(screen.getByText('0-40 / 120')).toBeInTheDocument()
  })

  test('does not render pager when visible=false', () => {
    render(
      <ControlPanel
        pagerProps={{
          visible: false,
          offset: 0,
          total: 120,
          limit: 40,
          onPageChange: vi.fn(),
          onLimitChange: vi.fn(),
        }}
      />,
    )
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })

  // ── View switcher ────────────────────────────────────────
  test('renders view switcher when available', () => {
    render(
      <ControlPanel
        currentView="list"
        availableViews={['list', 'form', 'kanban']}
        onSwitchView={vi.fn()}
      />,
    )
    expect(screen.getByTestId('view-switcher')).toBeInTheDocument()
  })

  test('does not render view switcher without onSwitchView', () => {
    render(<ControlPanel currentView="list" availableViews={['list']} />)
    expect(screen.queryByTestId('view-switcher')).not.toBeInTheDocument()
  })

  // ── Create button ────────────────────────────────────────
  test('renders Create button when showCreate=true and not form view', () => {
    render(<ControlPanel showCreate={true} onCreateClick={vi.fn()} currentView="list" />)
    expect(screen.getByText('Create')).toBeInTheDocument()
  })

  test('does not render Create button when showCreate=false', () => {
    render(<ControlPanel showCreate={false} onCreateClick={vi.fn()} currentView="list" />)
    expect(screen.queryByText('Create')).not.toBeInTheDocument()
  })

  test('does not render Create button in form view', () => {
    render(<ControlPanel showCreate={true} onCreateClick={vi.fn()} currentView="form" />)
    expect(screen.queryByText('Create')).not.toBeInTheDocument()
  })

  // ── Print menu ───────────────────────────────────────────
  test('renders Print dropdown with items', () => {
    render(<ControlPanel toolbar={toolbarWithPrint} />)
    expect(screen.getByText('Print')).toBeInTheDocument()
  })

  test('clicking Print opens dropdown with items', async () => {
    const user = userEvent.setup()
    render(<ControlPanel toolbar={toolbarWithPrint} />)

    await user.click(screen.getByText('Print'))
    expect(screen.getByText('Invoice PDF')).toBeInTheDocument()
    expect(screen.getByText('Delivery Slip')).toBeInTheDocument()
  })

  test('calls onPrintAction when print item clicked', async () => {
    const onPrintAction = vi.fn()
    const user = userEvent.setup()
    render(<ControlPanel toolbar={toolbarWithPrint} onPrintAction={onPrintAction} />)

    await user.click(screen.getByText('Print'))
    await user.click(screen.getByText('Invoice PDF'))
    expect(onPrintAction).toHaveBeenCalledWith(1)
  })

  // ── Action menu ──────────────────────────────────────────
  test('renders Action dropdown with items', () => {
    render(<ControlPanel toolbar={toolbarWithAction} />)
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  test('clicking Action opens dropdown with items', async () => {
    const user = userEvent.setup()
    render(<ControlPanel toolbar={toolbarWithAction} />)

    await user.click(screen.getByText('Action'))
    expect(screen.getByText('Export')).toBeInTheDocument()
    expect(screen.getByText('Merge')).toBeInTheDocument()
  })

  test('calls onActionExecuted when action item clicked', async () => {
    const onActionExecuted = vi.fn()
    const user = userEvent.setup()
    render(<ControlPanel toolbar={toolbarWithAction} onActionExecuted={onActionExecuted} />)

    await user.click(screen.getByText('Action'))
    await user.click(screen.getByText('Export'))
    expect(onActionExecuted).toHaveBeenCalledWith(10)
  })

  // ── Action menu with Duplicate/Archive entries ───────────
  test('renders Duplicate in Action menu when onDuplicate provided', async () => {
    const user = userEvent.setup()
    render(<ControlPanel onDuplicate={vi.fn()} />)

    await user.click(screen.getByText('Action'))
    expect(screen.getByText('Duplicate')).toBeInTheDocument()
  })

  test('renders Archive in Action menu when onArchive provided', async () => {
    const user = userEvent.setup()
    render(<ControlPanel onArchive={vi.fn()} />)

    await user.click(screen.getByText('Action'))
    expect(screen.getByText('Archive')).toBeInTheDocument()
  })

  test('renders Unarchive in Action menu when onUnarchive and hasActiveField', async () => {
    const user = userEvent.setup()
    render(<ControlPanel onUnarchive={vi.fn()} hasActiveField={true} />)

    await user.click(screen.getByText('Action'))
    expect(screen.getByText('Unarchive')).toBeInTheDocument()
  })

  test('does not render Unarchive when hasActiveField is false', async () => {
    const user = userEvent.setup()
    render(<ControlPanel onUnarchive={vi.fn()} hasActiveField={false} />)

    await user.click(screen.getByText('Action'))
    expect(screen.queryByText('Unarchive')).not.toBeInTheDocument()
  })

  test('calls onDuplicate when Duplicate clicked', async () => {
    const onDuplicate = vi.fn()
    const user = userEvent.setup()
    render(<ControlPanel onDuplicate={onDuplicate} />)

    await user.click(screen.getByText('Action'))
    await user.click(screen.getByText('Duplicate'))
    expect(onDuplicate).toHaveBeenCalledOnce()
  })

  // ── Both Print and Action ────────────────────────────────
  test('renders both Print and Action', () => {
    render(<ControlPanel toolbar={toolbarWithBoth} />)
    expect(screen.getByText('Print')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  // ── Empty / no toolbar ───────────────────────────────────
  test('renders without toolbar (no menus shown)', () => {
    render(<ControlPanel breadcrumbs={{ model: 'res.partner', viewType: 'list' }} />)
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    expect(screen.queryByText('Print')).not.toBeInTheDocument()
    expect(screen.queryByText('Action')).not.toBeInTheDocument()
  })

  // ── Selection info ───────────────────────────────────────
  test('shows selected count when selectedIds provided with pager', () => {
    render(
      <ControlPanel
        pagerProps={{
          visible: true,
          offset: 0,
          total: 100,
          limit: 40,
          onPageChange: vi.fn(),
          onLimitChange: vi.fn(),
        }}
        selectedIds={[1, 3, 5]}
      />,
    )
    expect(screen.getByText('3 selected')).toBeInTheDocument()
  })

  test('does not show selected count without pager', () => {
    render(<ControlPanel selectedIds={[1, 3, 5]} />)
    expect(screen.queryByText('selected')).not.toBeInTheDocument()
  })
})
