export function FormTimestamps({ record }: { record?: Record<string, unknown> }) {
  if (!record) return null
  const fmtDate = (v: unknown) => {
    if (!v) return ''
    const s = String(v).slice(0, 19).replace('T', ' ')
    return s || ''
  }
  const fmtUid = (v: unknown) => {
    if (!v) return ''
    if (Array.isArray(v) && v.length >= 2) return String(v[1])
    return String(v)
  }
  const items = [
    { label: 'Created', date: record.create_date, uid: record.create_uid },
    { label: 'Modified', date: record.write_date, uid: record.write_uid },
  ]
  if (!items.some((i) => i.date)) return null
  return (
    <div className="mt-4 border-t border-border-subtle pt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted">
      {items.map(({ label, date, uid }) =>
        date ? (
          <span key={label}>
            {label}: {fmtDate(date)}
            {fmtUid(uid) ? ` by ${fmtUid(uid)}` : ''}
          </span>
        ) : null,
      )}
    </div>
  )
}
