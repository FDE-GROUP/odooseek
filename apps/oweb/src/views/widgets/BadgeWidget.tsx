import { generateReportByXmlId } from '@odooseek/odoo-client'
import { createElement, useCallback, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useToast } from '../../hooks/useToast'
import { HR_BADGE_REPORT_XML_ID } from '../../lib/hr'
import { resolveOdooImageFromRecord } from '../../lib/odoo-image'
import type { FieldWidgetProps } from './index'

function BadgePreview({
  name,
  jobTitle,
  barcode,
  imageSrc,
}: {
  name: string
  jobTitle: string
  barcode: string
  imageSrc?: string
}) {
  return (
    <div className="badge flex flex-col items-center justify-center rounded-xl border-2 border-border-default p-4 print:break-inside-avoid">
      {imageSrc ? (
        <img src={imageSrc} alt="" className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-hover text-2xl text-text-muted">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="mt-2 text-sm font-semibold text-text-primary">{name}</div>
      {jobTitle ? <div className="text-xs text-text-muted">{jobTitle}</div> : null}
      <div className="mt-2 rounded bg-hover px-3 py-0.5 font-mono text-xs text-text-secondary">
        {barcode}
      </div>
    </div>
  )
}

export function BadgeWidget({ record, readOnly, model, recordId }: FieldWidgetProps) {
  const printHostRef = useRef<HTMLDivElement>(null)
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const barcode = record?.barcode as string | undefined
  const name = (record?.display_name as string) || (record?.name as string) || ''
  const jobTitle = (record?.job_title as string) || (record?.job_id as [number, string])?.[1] || ''
  const imageSrc = resolveOdooImageFromRecord(record, model, recordId)

  const handleBrowserPrint = useCallback(() => {
    const host = printHostRef.current
    if (!host) return
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    if (!printWindow) return
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Employee Badge</title>
<style>
  body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; }
  .badge { width: 243pt; min-height: 153pt; margin: 10pt auto; }
  @media print { @page { margin: 0; } }
</style></head><body><div id="root"></div></body></html>`)
    printWindow.document.close()
    const mount = printWindow.document.getElementById('root')
    if (!mount) return
    const root = createRoot(mount)
    root.render(createElement(BadgePreview, { name, jobTitle, barcode: barcode ?? '', imageSrc }))
    requestAnimationFrame(() => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    })
  }, [name, jobTitle, barcode, imageSrc])

  const handlePrint = useCallback(async () => {
    if (!recordId) {
      handleBrowserPrint()
      return
    }
    setBusy(true)
    try {
      await generateReportByXmlId(HR_BADGE_REPORT_XML_ID, [recordId])
    } catch {
      toast.info('PDF badge unavailable — opening browser print preview')
      handleBrowserPrint()
    } finally {
      setBusy(false)
    }
  }, [recordId, handleBrowserPrint, toast])

  if (!barcode) {
    return readOnly ? null : <div className="text-xs text-text-muted py-1">No barcode set</div>
  }

  return (
    <div className="py-2">
      <button
        type="button"
        onClick={handlePrint}
        disabled={busy}
        className="rounded-md border border-border-default bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-hover hover:text-text-primary transition-colors disabled:opacity-50"
      >
        {busy ? 'Generating…' : 'Print Badge'}
      </button>
      <div ref={printHostRef} className="sr-only" aria-hidden>
        <BadgePreview name={name} jobTitle={jobTitle} barcode={barcode} imageSrc={imageSrc} />
      </div>
    </div>
  )
}
