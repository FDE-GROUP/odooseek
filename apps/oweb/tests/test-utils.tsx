import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'
import type React from 'react'
import { DialogProvider } from '../src/hooks/useDialog'
import { ToastProvider } from '../src/hooks/useToast'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

export function createAllProviders(options?: { queryClient?: QueryClient }) {
  const queryClient = options?.queryClient ?? createTestQueryClient()
  return function AllProviders({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <DialogProvider>{children}</DialogProvider>
        </ToastProvider>
      </QueryClientProvider>
    )
  }
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions & { queryClient?: QueryClient },
) {
  const wrapper = createAllProviders({ queryClient: options?.queryClient })
  return render(ui, { wrapper, ...options })
}

export { screen, fireEvent, waitFor, within } from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'
