import { fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'
import { describe, expect, test } from 'vitest'
import { DialogProvider, useDialog } from '../../hooks/useDialog'
import { DialogContainer } from '../Dialog'

function DialogTrigger({
  title,
  content,
  size = 'md',
  closeOnBackdrop,
}: {
  title?: string
  content: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
}) {
  const { openDialog } = useDialog()
  return (
    <button
      type="button"
      data-testid="trigger"
      onClick={() => openDialog({ title, content, size, closeOnBackdrop })}
    >
      Open
    </button>
  )
}

function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <DialogProvider>
      {children}
      <DialogContainer />
    </DialogProvider>
  )
}

describe('Dialog', () => {
  test('opening a dialog adds it to the DOM', () => {
    const wrapper = createWrapper()
    render(<DialogTrigger title="Test Dialog" content="Hello world" />, {
      wrapper,
    })

    fireEvent.click(screen.getByTestId('trigger'))

    expect(screen.getByText('Test Dialog')).toBeInTheDocument()
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  test('closing a dialog removes it from the DOM', () => {
    const wrapper = createWrapper()
    render(<DialogTrigger title="Close Me" content="Content" />, { wrapper })

    fireEvent.click(screen.getByTestId('trigger'))
    expect(screen.getByText('Close Me')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '×' }))
    expect(screen.queryByText('Close Me')).not.toBeInTheDocument()
  })

  test('Escape key closes topmost dialog', () => {
    function MultiDialogTrigger() {
      const { openDialog } = useDialog()
      return (
        <>
          <button
            type="button"
            data-testid="open-a"
            onClick={() => openDialog({ title: 'Dialog A', content: 'A', size: 'md' })}
          >
            A
          </button>
          <button
            type="button"
            data-testid="open-b"
            onClick={() => openDialog({ title: 'Dialog B', content: 'B', size: 'md' })}
          >
            B
          </button>
        </>
      )
    }

    const wrapper = createWrapper()
    render(<MultiDialogTrigger />, { wrapper })

    fireEvent.click(screen.getByTestId('open-a'))
    fireEvent.click(screen.getByTestId('open-b'))

    expect(screen.getByText('Dialog A')).toBeInTheDocument()
    expect(screen.getByText('Dialog B')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByText('Dialog B')).not.toBeInTheDocument()
    expect(screen.getByText('Dialog A')).toBeInTheDocument()
  })

  test('backdrop click closes when closeOnBackdrop is true', () => {
    const wrapper = createWrapper()
    render(
      <DialogTrigger title="Backdrop Close" content="Click outside" closeOnBackdrop={true} />,
      { wrapper },
    )

    fireEvent.click(screen.getByTestId('trigger'))
    expect(screen.getByText('Backdrop Close')).toBeInTheDocument()

    const backdrop = screen
      .getByText('Click outside')
      .closest('.fixed')
      ?.querySelector('.bg-black\\/30')
    fireEvent.click(backdrop as HTMLElement)

    expect(screen.queryByText('Backdrop Close')).not.toBeInTheDocument()
  })

  test('backdrop click does not close when closeOnBackdrop is false', () => {
    const wrapper = createWrapper()
    render(
      <DialogTrigger title="No Backdrop Close" content="Stay open" closeOnBackdrop={false} />,
      { wrapper },
    )

    fireEvent.click(screen.getByTestId('trigger'))
    expect(screen.getByText('No Backdrop Close')).toBeInTheDocument()

    const backdrop = screen
      .getByText('Stay open')
      .closest('.fixed')
      ?.querySelector('.bg-black\\/30')
    fireEvent.click(backdrop as HTMLElement)

    expect(screen.getByText('No Backdrop Close')).toBeInTheDocument()
  })

  test('size classes are applied correctly', () => {
    const wrapper = createWrapper()
    render(<DialogTrigger content="Sized" size="lg" />, { wrapper })

    fireEvent.click(screen.getByTestId('trigger'))

    const dialogBox = screen.getByText('Sized').closest('.rounded-xl') as HTMLElement
    expect(dialogBox.className).toContain('max-w-[800px]')
  })

  test('DialogContainer returns null when no dialogs', () => {
    const { container } = render(
      <DialogProvider>
        <DialogContainer />
      </DialogProvider>,
    )
    expect(container.querySelector('.fixed')).toBeNull()
  })
})
