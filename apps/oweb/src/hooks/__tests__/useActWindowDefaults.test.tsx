import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { useActWindowDefaults } from '../useActWindowDefaults'

const { mockLoadAction, mockResolveAction } = vi.hoisted(() => ({
  mockLoadAction: vi.fn(),
  mockResolveAction: vi.fn(),
}))

vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return {
    ...actual,
    loadAction: mockLoadAction,
    resolveAction: mockResolveAction,
  }
})

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useActWindowDefaults', () => {
  beforeEach(() => {
    mockLoadAction.mockReset()
    mockResolveAction.mockReset()
  })

  test('loads view modes from action xml id', async () => {
    mockLoadAction.mockResolvedValue({
      type: 'ir.actions.act_window',
      res_model: 'hr.employee',
      view_mode: 'kanban,list,activity,graph,pivot',
    })

    const { result } = renderHook(
      () => useActWindowDefaults({ actionXmlId: 'hr.open_view_employee_list_my' }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.defaultViewType).toBe('kanban')
    expect(result.current.availableViews).toEqual(['kanban', 'list', 'activity', 'graph', 'pivot'])
  })

  test('loads view modes from numeric action id', async () => {
    mockResolveAction.mockResolvedValue({
      model: 'crm.lead',
      viewMode: 'kanban,list,form',
      viewTypes: ['kanban', 'list', 'form'],
      defaultViewType: 'kanban',
      domain: [],
      context: {},
    })

    const { result } = renderHook(() => useActWindowDefaults({ actionId: 472 }), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.defaultViewType).toBe('kanban')
    expect(mockResolveAction).toHaveBeenCalledWith(472)
  })

  test('returns fallback when disabled', () => {
    const { result } = renderHook(
      () => useActWindowDefaults({ actionXmlId: 'x', enabled: false, fallbackViewType: 'list' }),
      { wrapper },
    )
    expect(result.current.isLoading).toBe(false)
    expect(result.current.defaultViewType).toBe('list')
    expect(mockLoadAction).not.toHaveBeenCalled()
  })
})
