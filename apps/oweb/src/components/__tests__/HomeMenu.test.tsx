import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HomeMenuProvider, useHomeMenu } from '../../hooks/useHomeMenu'
import { HomeMenuOverlay } from '../HomeMenu'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ session: { uid: 1 } }),
}))

vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return {
    ...actual,
    callKw: vi.fn().mockResolvedValue([]),
    fetchMenus: vi.fn().mockResolvedValue({
      root: {
        id: 'root',
        name: 'root',
        children: [1, 2],
        appID: false,
        xmlid: '',
        actionID: false,
        actionModel: false,
        actionPath: false,
        webIcon: null,
        webIconData: null,
      },
      '1': {
        id: 1,
        name: 'CRM',
        children: [],
        appID: 1,
        xmlid: 'crm',
        actionID: 100,
        actionModel: 'ir.actions.act_window',
        actionPath: false,
        webIcon: null,
        webIconData: null,
      },
      '2': {
        id: 2,
        name: 'Sales',
        children: [],
        appID: 2,
        xmlid: 'sale',
        actionID: 200,
        actionModel: 'ir.actions.act_window',
        actionPath: false,
        webIcon: null,
        webIconData: null,
      },
    }),
    getApps: vi.fn((menus: Record<string, unknown>) => {
      const root = menus.root as { children: number[] }
      const ids = [...new Set(root.children)]
      return ids.map((id: number) => menus[String(id)]).filter(Boolean)
    }),
    getAppSections: vi.fn(() => []),
  }
})

function TestWrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <HomeMenuProvider>{children}</HomeMenuProvider>
    </QueryClientProvider>
  )
}

function OpenButton() {
  const { open } = useHomeMenu()
  return (
    <button type="button" onClick={open}>
      Open Menu
    </button>
  )
}

describe('HomeMenuOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('renders nothing when closed', () => {
    render(
      <TestWrapper>
        <HomeMenuOverlay />
      </TestWrapper>,
    )
    expect(screen.queryByText('Search apps...')).toBeNull()
  })

  it('renders app grid when open', async () => {
    render(
      <TestWrapper>
        <OpenButton />
        <HomeMenuOverlay />
      </TestWrapper>,
    )
    fireEvent.click(screen.getByText('Open Menu'))
    expect(await screen.findByText('CRM')).toBeDefined()
    expect(screen.getByText('Sales')).toBeDefined()
  })

  it('closes on Escape key', async () => {
    render(
      <TestWrapper>
        <OpenButton />
        <HomeMenuOverlay />
      </TestWrapper>,
    )
    fireEvent.click(screen.getByText('Open Menu'))
    expect(await screen.findByText('CRM')).toBeDefined()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByText('CRM')).toBeNull()
  })

  it('updates search input value', async () => {
    render(
      <TestWrapper>
        <OpenButton />
        <HomeMenuOverlay />
      </TestWrapper>,
    )
    fireEvent.click(screen.getByText('Open Menu'))
    expect(await screen.findByText('CRM')).toBeDefined()
    const input = screen.getByPlaceholderText('Search apps...')
    fireEvent.change(input, { target: { value: 'sal' } })
    expect(input).toHaveValue('sal')
  })

  it('filters apps by search query', async () => {
    render(
      <TestWrapper>
        <OpenButton />
        <HomeMenuOverlay />
      </TestWrapper>,
    )
    fireEvent.click(screen.getByText('Open Menu'))
    expect(await screen.findByText('CRM')).toBeDefined()
    const input = screen.getByPlaceholderText('Search apps...')
    fireEvent.change(input, { target: { value: 'sal' } })
    await waitFor(() => {
      const visible = screen.queryAllByText(/^(CRM|Sales)$/)
      expect(visible.map((el) => el.textContent)).toEqual(['Sales'])
    })
  })
})
