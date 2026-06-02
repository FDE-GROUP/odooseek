import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import type { OrgChartEmployee } from '../../../lib/hr-org-chart'
import { OrgChartSubPopover } from '../OrgChartSubPopover'

const employee: OrgChartEmployee = {
  id: 42,
  name: 'Alice',
  job_name: 'Engineer',
  direct_sub_count: 2,
  indirect_sub_count: 5,
}

describe('OrgChartSubPopover', () => {
  test('opens popover and triggers team navigation', () => {
    const onOpenTeam = vi.fn()
    const onOpenEmployee = vi.fn()

    render(
      <OrgChartSubPopover
        employee={employee}
        open
        onToggle={vi.fn()}
        onClose={vi.fn()}
        onOpenEmployee={onOpenEmployee}
        onOpenTeam={onOpenTeam}
      />,
    )

    expect(screen.getByText('Direct subordinates')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Direct subordinates' }))
    expect(onOpenTeam).toHaveBeenCalledWith(42, 'direct')

    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(onOpenEmployee).toHaveBeenCalledWith(42)
  })
})
