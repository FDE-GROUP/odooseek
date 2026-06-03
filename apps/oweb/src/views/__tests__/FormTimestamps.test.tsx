import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { FormTimestamps } from '../form/FormTimestamps'

describe('FormTimestamps', () => {
  test('renders nothing when no record', () => {
    const { container } = render(<FormTimestamps />)
    expect(container.innerHTML).toBe('')
  })

  test('renders nothing when record has no dates', () => {
    const { container } = render(<FormTimestamps record={{ id: 1, name: 'Test' }} />)
    expect(container.innerHTML).toBe('')
  })

  test('renders created date', () => {
    render(<FormTimestamps record={{ id: 1, create_date: '2026-06-03 10:00:00' }} />)
    expect(screen.getByText(/Created:/)).toBeInTheDocument()
    expect(screen.getByText(/2026-06-03 10:00/)).toBeInTheDocument()
  })

  test('renders modified date', () => {
    render(<FormTimestamps record={{ id: 1, write_date: '2026-06-03 14:30:00' }} />)
    expect(screen.getByText(/Modified:/)).toBeInTheDocument()
    expect(screen.getByText(/2026-06-03 14:30/)).toBeInTheDocument()
  })

  test('renders both created and modified', () => {
    render(
      <FormTimestamps record={{ id: 1, create_date: '2026-01-01', write_date: '2026-06-03' }} />,
    )
    expect(screen.getByText(/Created:/)).toBeInTheDocument()
    expect(screen.getByText(/Modified:/)).toBeInTheDocument()
  })

  test('renders user display name when uid is array', () => {
    render(
      <FormTimestamps
        record={{ id: 1, create_date: '2026-01-01', create_uid: [2, 'Admin User'] }}
      />,
    )
    expect(screen.getByText(/by Admin User/)).toBeInTheDocument()
  })

  test('renders user id as string when uid is not array', () => {
    render(<FormTimestamps record={{ id: 1, write_date: '2026-01-01', write_uid: 42 }} />)
    expect(screen.getByText(/by 42/)).toBeInTheDocument()
  })

  test('ignores empty user id', () => {
    render(<FormTimestamps record={{ id: 1, create_date: '2026-01-01', create_uid: false }} />)
    expect(screen.queryByText(/by/)).not.toBeInTheDocument()
  })

  test('truncates ISO datetime to YYYY-MM-DD HH:MM', () => {
    render(<FormTimestamps record={{ id: 1, create_date: '2026-06-03T10:30:45.123Z' }} />)
    expect(screen.getByText(/2026-06-03 10:30/)).toBeInTheDocument()
  })
})
