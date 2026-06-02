import { callKw, loadAction } from './api'

interface ReportAction {
  report_name: string
  report_type: string
  model: string
  binding_view_types?: string
}

/// Generate a report (PDF/XLSX) by reading the report action and opening
/// the download URL via the backend proxy.  The proxy forwards cookies to
/// Odoo so the user's session is preserved.
export async function generateReport(actionId: number, ids: number[]): Promise<void> {
  // Read the report action details
  const [action] = await callKw<Array<ReportAction>>('ir.actions.report', 'read', [
    [actionId],
    ['report_name', 'report_type', 'model', 'binding_view_types'],
  ])

  if (!action) {
    throw new Error(`Report action ${actionId} not found`)
  }

  const reportType = action.report_type || 'pdf'
  const extension = reportType === 'xlsx' ? 'xlsx' : 'pdf'

  // Open the report via the backend proxy
  const params = new URLSearchParams({
    report_id: String(actionId),
    ids: ids.join(','),
    report_type: extension,
  })
  const url = `/api/report/download?${params}`
  window.open(url, '_blank')
}

/// Resolve a report action by xml id and open the download URL.
export async function generateReportByXmlId(xmlId: string, ids: number[]): Promise<void> {
  const action = await loadAction(xmlId)
  const actionId = action.id
  if (!actionId) {
    throw new Error(`Report action ${xmlId} not found`)
  }
  await generateReport(actionId, ids)
}
