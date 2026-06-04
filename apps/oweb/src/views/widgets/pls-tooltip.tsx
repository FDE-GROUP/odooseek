import { callKw } from '@odooseek/odoo-client'
import { useState } from 'react'
import type { FieldWidgetProps } from './index'

interface PlsData {
  probability: number
  top_factors?: Array<{ label: string; value: number }>
  low_factors?: Array<{ label: string; value: number }>
}

export function PlsTooltipWidget({ record, readOnly }: FieldWidgetProps) {
  const [data, setData] = useState<PlsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  if (readOnly || !record?.id) return null

  const fetchPlsData = async () => {
    if (data) {
      setOpen(!open)
      return
    }
    setLoading(true)
    try {
      const result = await callKw<PlsData>('crm.lead', 'prepare_pls_tooltip_data', [
        [record.id as number],
      ])
      setData(result)
      setOpen(true)
    } catch {
      // PLS not available for this lead
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={fetchPlsData}
        disabled={loading}
        className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-text-muted hover:bg-hover hover:text-accent disabled:opacity-50"
        title="Predictive Lead Scoring"
      >
        {loading ? '…' : '🧠'}
      </button>

      {open && data && (
        <div className="absolute left-0 top-full z-40 mt-1 w-72 rounded-lg border border-border-subtle bg-surface p-3 shadow-xl">
          <div className="mb-2 flex items-center gap-3">
            <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
              <title>Win Probability</title>
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="var(--color-border-default)"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={2 * Math.PI * 20 * (1 - data.probability / 100)}
                className="text-accent"
                transform="rotate(-90 24 24)"
              />
              <text
                x="24"
                y="24"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-text-primary text-xs font-bold"
              >
                {data.probability}%
              </text>
            </svg>
            <div>
              <div className="text-xs font-medium text-text-primary">Win Probability</div>
              <div className="text-[10px] text-text-muted">Predictive Lead Scoring</div>
            </div>
          </div>

          {data.top_factors && data.top_factors.length > 0 && (
            <div className="mb-1">
              <div className="mb-1 text-[10px] font-medium text-success">Top positive factors</div>
              {data.top_factors.slice(0, 3).map((f, i) => (
                <div key={i} className="mb-0.5 flex items-center gap-2">
                  <span className="w-20 truncate text-[10px] text-text-secondary">{f.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-border-default/30">
                    <div
                      className="h-full rounded-full bg-success"
                      style={{ width: `${Math.min(100, f.value)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.low_factors && data.low_factors.length > 0 && (
            <div>
              <div className="mb-1 text-[10px] font-medium text-danger">Negative factors</div>
              {data.low_factors.slice(0, 3).map((f, i) => (
                <div key={i} className="mb-0.5 flex items-center gap-2">
                  <span className="w-20 truncate text-[10px] text-text-secondary">{f.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-border-default/30">
                    <div
                      className="h-full rounded-full bg-danger"
                      style={{ width: `${Math.min(100, f.value)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
