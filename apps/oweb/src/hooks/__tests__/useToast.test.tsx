import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest'
import { ToastProvider, useToast } from '../useToast'

function wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('starts with empty toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    expect(result.current.toasts).toEqual([])
  })

  test('addToast adds a toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.success('Operation succeeded')
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].type).toBe('success')
    expect(result.current.toasts[0].message).toBe('Operation succeeded')
  })

  test('addToast generates sequential IDs', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.info('First')
      result.current.warning('Second')
    })

    expect(result.current.toasts.map((t) => t.id)).toEqual([1, 2])
  })

  test('removeToast removes by id', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.success('A')
      result.current.success('B')
    })

    act(() => {
      result.current.removeToast(1)
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('B')
  })

  test('helpful sugar methods use correct types', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => { result.current.success('ok') })
    act(() => { result.current.error('fail') })
    act(() => { result.current.warning('warn') })
    act(() => { result.current.info('info') })

    const types = result.current.toasts.map((t) => t.type)
    expect(types).toEqual(['success', 'error', 'warning', 'info'])
  })

  test('caps at MAX_TOASTS (5)', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      for (let i = 0; i < 7; i++) {
        result.current.info(`msg ${i}`)
      }
    })

    // Only keeps last 5
    expect(result.current.toasts).toHaveLength(5)
    expect(result.current.toasts[0].message).toBe('msg 2')
    expect(result.current.toasts[4].message).toBe('msg 6')
  })

  test('auto-dismisses after DISMISS_MS (4000ms)', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.success('auto-dismiss me')
    })

    expect(result.current.toasts).toHaveLength(1)

    // Advance past the dismiss timer
    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  test('clears timeout on manual remove', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.success('remove me')
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      result.current.removeToast(1)
    })

    expect(result.current.toasts).toHaveLength(0)

    // Advancing past 4s should NOT trigger a stale remove (no effect)
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  test('throws if used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useToast())
    }).toThrow('useToast must be used within ToastProvider')

    spy.mockRestore()
  })
})
