import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import type { FieldWidgetProps } from '../index'
import { ImageFieldWidget } from '../media'
import { Rainbowman } from '../Rainbowman'

function withQuery(children: React.ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('ImageFieldWidget', () => {
  test('renders image when value exists', () => {
    const field = {
      name: 'image_128',
      type: 'binary',
      string: 'Image',
    } as unknown as FieldWidgetProps['field']
    const { container } = render(
      withQuery(<ImageFieldWidget value="iVBORw0KGgo..." onChange={vi.fn()} field={field} />),
    )
    expect(container.querySelector('img')).toBeDefined()
  })
})

describe('Rainbowman', () => {
  test('renders congratulations message', () => {
    render(withQuery(<Rainbowman model="crm.lead" recordId={1} onDismiss={vi.fn()} />))
    expect(screen.getByText('Opportunity Won!')).toBeDefined()
  })

  test('calls onDismiss when dismiss button clicked', () => {
    const onDismiss = vi.fn()
    render(withQuery(<Rainbowman model="crm.lead" recordId={1} onDismiss={onDismiss} />))
    fireEvent.click(screen.getByText('Dismiss'))
    expect(onDismiss).toHaveBeenCalled()
  })
})
