/// <reference types="vitest" />
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { callKw, loadAction } from '../api'
import { generateReport, generateReportByXmlId } from '../report'

vi.mock('../api', () => ({
  callKw: vi.fn(),
  loadAction: vi.fn(),
}))

const mockCallKw = vi.mocked(callKw)
const mockLoadAction = vi.mocked(loadAction)

describe('generateReport', () => {
  const mockOpen = vi.fn()
  const originalOpen = window.open

  beforeEach(() => {
    vi.clearAllMocks()
    window.open = mockOpen
  })

  afterEach(() => {
    window.open = originalOpen
  })

  test('calls callKw with correct args to read the report action', async () => {
    mockCallKw.mockResolvedValue([
      {
        report_name: 'sale.report_saleorder',
        report_type: 'pdf',
        model: 'sale.order',
        binding_view_types: 'form',
      },
    ])

    await generateReport(42, [1, 2, 3])

    expect(mockCallKw).toHaveBeenCalledWith('ir.actions.report', 'read', [
      [42],
      ['report_name', 'report_type', 'model', 'binding_view_types'],
    ])
  })

  test('opens a new window with the correct URL for PDF', async () => {
    mockCallKw.mockResolvedValue([
      {
        report_name: 'sale.report_saleorder',
        report_type: 'pdf',
        model: 'sale.order',
      },
    ])

    await generateReport(42, [1, 2])

    expect(mockOpen).toHaveBeenCalledTimes(1)
    const url = mockOpen.mock.calls[0][0]
    expect(url).toContain('/api/report/download?')
    expect(url).toContain('report_id=42')
    expect(url).toContain('ids=1%2C2')
    expect(url).toContain('report_type=pdf')
    expect(mockOpen.mock.calls[0][1]).toBe('_blank')
  })

  test('opens a new window with xlsx extension when report_type is xlsx', async () => {
    mockCallKw.mockResolvedValue([
      {
        report_name: 'account.report_invoice',
        report_type: 'xlsx',
        model: 'account.move',
      },
    ])

    await generateReport(99, [10])

    const url = mockOpen.mock.calls[0][0]
    expect(url).toContain('report_type=xlsx')
  })

  test('defaults to pdf when report_type is empty', async () => {
    mockCallKw.mockResolvedValue([
      {
        report_name: 'sale.report_saleorder',
        report_type: '',
        model: 'sale.order',
      },
    ])

    await generateReport(42, [1])

    const url = mockOpen.mock.calls[0][0]
    expect(url).toContain('report_type=pdf')
  })

  test('throws if report action not found', async () => {
    mockCallKw.mockResolvedValue([])

    await expect(generateReport(999, [1])).rejects.toThrow('Report action 999 not found')
  })

  test('throws if report action is undefined', async () => {
    mockCallKw.mockResolvedValue([undefined])

    await expect(generateReport(123, [1])).rejects.toThrow('Report action 123 not found')
  })
})

describe('generateReportByXmlId', () => {
  const mockOpen = vi.fn()
  const originalOpen = window.open

  beforeEach(() => {
    vi.clearAllMocks()
    window.open = mockOpen
  })

  afterEach(() => {
    window.open = originalOpen
  })

  test('loads report action by xml id then opens download URL', async () => {
    mockLoadAction.mockResolvedValue({
      type: 'ir.actions.report',
      id: 55,
      report_name: 'hr.print_employee_badge',
      report_type: 'qweb-pdf',
    })
    mockCallKw.mockResolvedValue([
      {
        report_name: 'hr.print_employee_badge',
        report_type: 'pdf',
        model: 'hr.employee',
      },
    ])

    await generateReportByXmlId('hr.hr_employee_print_badge', [7])

    expect(mockLoadAction).toHaveBeenCalledWith('hr.hr_employee_print_badge')
    expect(mockOpen).toHaveBeenCalledTimes(1)
    const url = mockOpen.mock.calls[0][0] as string
    expect(url).toContain('report_id=55')
    expect(url).toContain('ids=7')
  })

  test('throws if xml id action has no database id', async () => {
    mockLoadAction.mockResolvedValue({ type: 'ir.actions.report' })

    await expect(generateReportByXmlId('hr.hr_employee_print_badge', [1])).rejects.toThrow(
      'Report action hr.hr_employee_print_badge not found',
    )
  })
})
