import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ToastProvider } from '../../../hooks/useToast'
import { HR_BADGE_REPORT_XML_ID } from '../../../lib/hr'
import { BadgeWidget } from '../BadgeWidget'

const { mockGenerateReportByXmlId } = vi.hoisted(() => ({
  mockGenerateReportByXmlId: vi.fn(),
}))

vi.mock('@odooseek/odoo-client', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@odooseek/odoo-client')
  return {
    ...actual,
    generateReportByXmlId: mockGenerateReportByXmlId,
  }
})

function renderBadge(recordId?: number) {
  return render(
    <ToastProvider>
      <BadgeWidget
        field={{ type: 'field', name: 'barcode', widget: 'badge_print' }}
        value="EMP001"
        record={{
          id: recordId ?? 1,
          barcode: 'EMP001',
          display_name: 'Alice',
          job_title: 'Engineer',
        }}
        model="hr.employee"
        recordId={recordId}
        readOnly={false}
        onChange={() => {}}
      />
    </ToastProvider>,
  )
}

describe('BadgeWidget', () => {
  beforeEach(() => {
    mockGenerateReportByXmlId.mockReset()
    vi.stubGlobal(
      'open',
      vi.fn(() => ({ document: { write: vi.fn(), close: vi.fn(), getElementById: vi.fn() } })),
    )
  })

  test('module can be imported', async () => {
    const mod = await import('../BadgeWidget')
    expect(mod.BadgeWidget).toBeDefined()
  })

  test('widget is registered as badge_print in overrides', async () => {
    const { getFieldWidget } = await import('../index')
    const field = { name: 'test', widget: 'badge_print', type: 'char' } as any
    const Widget = getFieldWidget(field, 'char')
    expect(Widget).toBeDefined()
  })

  test('calls Odoo PDF report when record id is present', async () => {
    mockGenerateReportByXmlId.mockResolvedValue(undefined)
    renderBadge(42)

    fireEvent.click(screen.getByRole('button', { name: 'Print Badge' }))

    await waitFor(() => {
      expect(mockGenerateReportByXmlId).toHaveBeenCalledWith(HR_BADGE_REPORT_XML_ID, [42])
    })
  })

  test('falls back to browser print when PDF report fails', async () => {
    mockGenerateReportByXmlId.mockRejectedValue(new Error('forbidden'))
    const openSpy = vi.fn(() => ({
      document: {
        write: vi.fn(),
        close: vi.fn(),
        getElementById: vi.fn(() => document.createElement('div')),
      },
      focus: vi.fn(),
      print: vi.fn(),
      close: vi.fn(),
    }))
    vi.stubGlobal('open', openSpy)

    renderBadge(42)
    fireEvent.click(screen.getByRole('button', { name: 'Print Badge' }))

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalled()
    })
  })
})
