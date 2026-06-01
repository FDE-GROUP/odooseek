import { useCallback, useRef } from 'react'
import type { FieldWidgetProps } from './index'

export function BadgeWidget({ record, readOnly }: FieldWidgetProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const barcode = record?.barcode as string | undefined
  const name = (record?.display_name as string) || (record?.name as string) || ''
  const jobTitle = (record?.job_title as string) || (record?.job_id as [number, string])?.[1] || ''
  const imageSrc = (record?.image_128 as string) || (record?.avatar_128 as string) || ''

  const handlePrint = useCallback(() => {
    if (!printRef.current) return
    const content = printRef.current.innerHTML
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head><title>Employee Badge</title>
        <style>
          body { margin:0; padding:0; display:flex; flex-wrap:wrap; justify-content:center; }
          .badge { width:243pt; height:153pt; border:2px solid #ccc; border-radius:12pt; margin:10pt; display:flex; flex-direction:column; align-items:center; justify-content:center; page-break-inside:avoid; }
          .badge img.avatar { width:64pt; height:64pt; border-radius:50%; object-fit:cover; }
          .badge .name { font-size:14pt; font-weight:600; margin-top:8pt; }
          .badge .job { font-size:10pt; color:#666; margin-top:2pt; }
          .badge .barcode-text { font-size:9pt; color:#333; margin-top:6pt; font-family:monospace; background:#f0f0f0; padding:2pt 12pt; border-radius:4pt; }
          @media print { @page { margin:0; size:auto; } body { margin:0; } }
        </style></head>
        <body>${content}</body>
      </html>`)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }, [])

  if (!barcode) {
    return readOnly ? null : <div className="text-xs text-text-muted py-1">No barcode set</div>
  }

  const badgeHtml = `
    <div class="badge">
      ${imageSrc ? `<img class="avatar" src="${imageSrc}" alt="${name}" />` : `<div class="avatar" style="width:64pt;height:64pt;border-radius:50%;background:#e0e0e0;display:flex;align-items:center;justify-content:center;font-size:24pt;color:#666;">${name.charAt(0).toUpperCase()}</div>`}
      <div class="name">${name}</div>
      ${jobTitle ? `<div class="job">${jobTitle}</div>` : ''}
      <div class="barcode-text">${barcode}</div>
    </div>
  `

  return (
    <div className="py-2">
      <button
        type="button"
        onClick={handlePrint}
        className="rounded-md border border-border-default bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
      >
        Print Badge
      </button>
      <div
        ref={printRef}
        style={{ display: 'none' }}
        dangerouslySetInnerHTML={{ __html: badgeHtml }}
      />
    </div>
  )
}
