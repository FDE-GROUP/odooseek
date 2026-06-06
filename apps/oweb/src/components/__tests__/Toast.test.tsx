import { act, fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ToastProvider, useToast } from '../../hooks/useToast'
import { ToastContainer } from '../Toast'

function ToastTrigger({
  type,
  message,
}: {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}) {
  const toast = useToast()
  return (
    <button type="button" data-testid="trigger" onClick={() => toast[type](message)}>
      {type}
    </button>
  )
}

function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  )
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('renders toast on trigger', () => {
    const wrapper = createWrapper()
    render(<ToastTrigger type="success" message="Saved!" />, { wrapper })

    fireEvent.click(screen.getByTestId('trigger'))
    expect(screen.getByText('Saved!')).toBeInTheDocument()
  })

  test('renders different toast types', () => {
    const wrapper = createWrapper()

    function MultiTrigger() {
      const toast = useToast()
      return (
        <>
          <button type="button" data-testid="s" onClick={() => toast.success('ok')}>
            s
          </button>
          <button type="button" data-testid="e" onClick={() => toast.error('fail')}>
            e
          </button>
        </>
      )
    }

    render(<MultiTrigger />, { wrapper })
    fireEvent.click(screen.getByTestId('s'))
    fireEvent.click(screen.getByTestId('e'))

    expect(screen.getByText('ok')).toBeInTheDocument()
    expect(screen.getByText('fail')).toBeInTheDocument()
  })

  test('auto-dismisses after 4 seconds', () => {
    const wrapper = createWrapper()
    render(<ToastTrigger type="info" message="Auto dismiss" />, { wrapper })

    fireEvent.click(screen.getByTestId('trigger'))
    expect(screen.getByText('Auto dismiss')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument()
  })

  test('manual dismiss via close button', () => {
    const wrapper = createWrapper()
    render(<ToastTrigger type="warning" message="Close me" />, { wrapper })

    fireEvent.click(screen.getByTestId('trigger'))
    expect(screen.getByText('Close me')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close notification' }))

    expect(screen.queryByText('Close me')).not.toBeInTheDocument()
  })

  test('ToastContainer returns null when no toasts', () => {
    const { container } = render(
      <ToastProvider>
        <ToastContainer />
      </ToastProvider>,
    )
    expect(container.querySelector('.fixed')).toBeNull()
  })
})
