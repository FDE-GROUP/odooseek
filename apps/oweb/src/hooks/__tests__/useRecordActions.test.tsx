import { describe, expect, test, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// Mock callKw before importing the hook
vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return {
    ...actual as Record<string, unknown>,
    ...{
  callKw: vi.fn(),
}
  }
})

import { callKw } from '@odooseek/odoo-client'
import { useRecordActions } from '../useRecordActions'

const mockCallKw = vi.mocked(callKw)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('useRecordActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('duplicate calls copy with correct args', async () => {
    mockCallKw.mockResolvedValueOnce(42)

    const { result } = renderHook(() => useRecordActions('res.partner'), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.duplicate.mutateAsync(1)
    })

    expect(mockCallKw).toHaveBeenCalledWith('res.partner', 'copy', [[1]])
    await waitFor(() => {
      expect(result.current.duplicate.data).toBe(42)
    })
  })

  test('archive calls action_archive with correct args', async () => {
    mockCallKw.mockResolvedValueOnce(true)

    const { result } = renderHook(() => useRecordActions('res.partner'), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.archive.mutate([1, 2, 3])
    })

    expect(mockCallKw).toHaveBeenCalledWith('res.partner', 'action_archive', [[1, 2, 3]])
  })

  test('unarchive calls action_unarchive with correct args', async () => {
    mockCallKw.mockResolvedValueOnce(true)

    const { result } = renderHook(() => useRecordActions('sale.order'), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.unarchive.mutate([5, 6])
    })

    expect(mockCallKw).toHaveBeenCalledWith('sale.order', 'action_unarchive', [[5, 6]])
  })

  test('duplicate invalidates query cache on success', async () => {
    const invalidateSpy = vi.spyOn(QueryClient.prototype, 'invalidateQueries')
    mockCallKw.mockResolvedValueOnce(99)

    const { result } = renderHook(() => useRecordActions('res.partner'), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.duplicate.mutate(1)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['odoo', 'data', 'res.partner'],
    })
  })

  test('archive invalidates query cache on success', async () => {
    const invalidateSpy = vi.spyOn(QueryClient.prototype, 'invalidateQueries')
    mockCallKw.mockResolvedValueOnce(true)

    const { result } = renderHook(() => useRecordActions('res.partner'), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.archive.mutate([1])
    })

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['odoo', 'data', 'res.partner'],
    })
  })

  test('unarchive invalidates query cache on success', async () => {
    const invalidateSpy = vi.spyOn(QueryClient.prototype, 'invalidateQueries')
    mockCallKw.mockResolvedValueOnce(true)

    const { result } = renderHook(() => useRecordActions('res.partner'), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.unarchive.mutate([1])
    })

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['odoo', 'data', 'res.partner'],
    })
  })
})
