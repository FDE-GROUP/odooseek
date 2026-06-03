import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { HelpPopover } from '../form/HelpPopover'

describe('HelpPopover', () => {
  test('renders a ? button', () => {
    render(<HelpPopover text="Help text" />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  test('shows tooltip on click', () => {
    render(<HelpPopover text="This is help text" />)
    fireEvent.click(screen.getByText('?'))
    expect(screen.getByText('This is help text')).toBeInTheDocument()
  })

  test('hides tooltip on blur', async () => {
    render(<HelpPopover text="Temporary help" />)
    fireEvent.click(screen.getByText('?'))
    expect(screen.getByText('Temporary help')).toBeInTheDocument()
    fireEvent.blur(screen.getByText('?'))
    // After blur with setTimeout(150), tooltip should hide
    await new Promise((r) => setTimeout(r, 200))
    expect(screen.queryByText('Temporary help')).not.toBeInTheDocument()
  })
})
