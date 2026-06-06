import { isNotFound, isRedirect } from '@tanstack/react-router'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

function isRouterControlFlow(error: unknown): boolean {
  return isRedirect(error) || isNotFound(error) || error instanceof Promise || error == null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: unknown): State | null {
    if (isRouterControlFlow(error)) throw error
    if (error instanceof Error) return { hasError: true, error }
    return { hasError: true, error: new Error(String(error)) }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    if (isRouterControlFlow(error)) return
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="flex h-screen items-center justify-center bg-root text-text-primary"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="mt-2 text-sm text-text-secondary">{this.state.error?.message}</p>
              <button
                type="button"
                className="mt-4 cursor-pointer rounded bg-accent px-4 py-2 text-sm"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try Again
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}
