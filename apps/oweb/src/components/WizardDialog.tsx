import { callKw, nameSearch } from '@odooseek/odoo-client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../hooks/useToast'
import {
  enrichWizardContext,
  recordToWizardValues,
  wizardValuesToWrite,
} from '../lib/wizard-context'

interface WizardField {
  name: string
  type: string
  string: string
  required?: boolean
  selection?: [string, string][]
  relation?: string
  widget?: string
}

export interface WizardStep {
  title: string
  fields: string[]
  buttons: WizardButton[]
}

export interface WizardButton {
  label: string
  type: 'object' | 'action'
  name: string
  special?: 'cancel' | 'close'
  states?: string
}

interface WizardDialogProps {
  open: boolean
  model: string
  context?: Record<string, unknown>
  steps: WizardStep[]
  onDone: () => void
  onCancel: () => void
}

function WizardMany2oneInput({
  fieldName,
  fieldDef,
  value,
  onChange,
}: {
  fieldName: string
  fieldDef: WizardField
  value: unknown
  onChange: (field: string, value: unknown) => void
}) {
  const relation = fieldDef.relation
  const { data: options = [] } = useQuery({
    queryKey: ['odoo', 'wizard', 'many2one', relation, fieldName],
    queryFn: () => {
      if (!relation) return []
      return nameSearch(relation, '', 50).then((rows) => rows.map(([id, label]) => ({ id, label })))
    },
    enabled: !!relation,
    staleTime: 60_000,
  })

  return (
    <select
      value={value === '' || value == null ? '' : String(value)}
      onChange={(e) => onChange(fieldName, e.target.value ? Number(e.target.value) : '')}
      className="rounded-md border border-border-default bg-root px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
      required={fieldDef.required}
    >
      <option value="" />
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function WizardFieldInput({
  fieldName,
  fieldDef,
  value,
  onChange,
}: {
  fieldName: string
  fieldDef?: WizardField
  value: unknown
  onChange: (field: string, value: unknown) => void
}) {
  if (!fieldDef) {
    return (
      <input
        type="text"
        value={String(value ?? '')}
        onChange={(e) => onChange(fieldName, e.target.value)}
        className="rounded-md border border-border-default bg-root px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
      />
    )
  }

  if (fieldDef.type === 'boolean') {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(fieldName, e.target.checked)}
        className="h-4 w-4 rounded border-border-default"
      />
    )
  }

  if (fieldDef.type === 'date') {
    return (
      <input
        type="date"
        value={String(value ?? '')}
        onChange={(e) => onChange(fieldName, e.target.value)}
        className="rounded-md border border-border-default bg-root px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
        required={fieldDef.required}
      />
    )
  }

  if (fieldDef.type === 'many2one' && fieldDef.relation) {
    return (
      <WizardMany2oneInput
        fieldName={fieldName}
        fieldDef={fieldDef}
        value={value}
        onChange={onChange}
      />
    )
  }

  if (fieldDef.type === 'selection' && fieldDef.selection) {
    if (fieldDef.widget === 'radio') {
      return (
        <div className="flex flex-col gap-1">
          {fieldDef.selection.map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={fieldName}
                value={k}
                checked={String(value) === k}
                onChange={() => onChange(fieldName, k)}
                className="accent-accent"
              />
              <span className="text-text-primary">{label}</span>
            </label>
          ))}
        </div>
      )
    }
    return (
      <select
        value={String(value ?? '')}
        onChange={(e) => onChange(fieldName, e.target.value)}
        className="rounded-md border border-border-default bg-root px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
        required={fieldDef.required}
      >
        <option value="" />
        {fieldDef.selection.map((entry) => (
          <option key={entry[0]} value={entry[0]}>
            {entry[1]}
          </option>
        ))}
      </select>
    )
  }

  if (fieldDef.type === 'html') {
    return (
      <textarea
        value={String(value ?? '')}
        onChange={(e) => onChange(fieldName, e.target.value)}
        rows={5}
        className="rounded-md border border-border-default bg-root px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
        required={fieldDef.required}
        placeholder="Enter feedback..."
      />
    )
  }

  const multiline = fieldDef.type === 'text' || fieldName.includes('description')
  if (multiline) {
    return (
      <textarea
        value={String(value ?? '')}
        onChange={(e) => onChange(fieldName, e.target.value)}
        rows={3}
        className="rounded-md border border-border-default bg-root px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
        required={fieldDef.required}
      />
    )
  }

  return (
    <input
      type="text"
      value={String(value ?? '')}
      onChange={(e) => onChange(fieldName, e.target.value)}
      className="rounded-md border border-border-default bg-root px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
      required={fieldDef.required}
    />
  )
}

export function WizardDialog({
  open,
  model,
  context = {},
  steps,
  onDone,
  onCancel,
}: WizardDialogProps) {
  const toast = useToast()
  const wizardContext = enrichWizardContext(context)
  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [wizardId, setWizardId] = useState<number | null>(null)

  const step = steps[stepIndex]

  useEffect(() => {
    if (!open) {
      setStepIndex(0)
      setValues({})
      setWizardId(null)
    }
  }, [open])

  const { isPending: isCreating, error: createQueryError } = useQuery({
    queryKey: ['odoo', 'wizard', model, 'create', open, wizardContext.active_id],
    queryFn: async () => {
      const id = await callKw<number>(model, 'create', [{}], { context: wizardContext })
      setWizardId(id)
      return id
    },
    enabled: open && wizardId === null,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  })

  const createError = createQueryError?.message ?? null

  const { data: fieldDefs, isLoading: isLoadingFields } = useQuery({
    queryKey: ['odoo', 'wizard', model, 'fields_get'],
    queryFn: () =>
      callKw<Record<string, WizardField>>(model, 'fields_get', [[], []], {}).catch(
        () => ({}) as Record<string, WizardField>,
      ),
    enabled: open && !!wizardId,
    staleTime: 5 * 60_000,
  })

  useQuery({
    queryKey: ['odoo', 'wizard', model, wizardId, 'initial', step.fields],
    queryFn: async () => {
      if (!wizardId || step.fields.length === 0) return null
      const rows = await callKw<Array<Record<string, unknown>>>(
        model,
        'read',
        [[wizardId], step.fields],
        { context: wizardContext },
      )
      const initial = recordToWizardValues(rows[0] ?? {}, step.fields)
      setValues((prev) => ({ ...initial, ...prev }))
      return rows[0]
    },
    enabled: open && wizardId !== null && step.fields.length > 0,
    staleTime: Number.POSITIVE_INFINITY,
  })

  const stepMutation = useMutation({
    mutationFn: async ({
      button,
      stepValues,
    }: {
      button: WizardButton
      stepValues: Record<string, unknown>
    }) => {
      if (!wizardId) return
      const writeVals = wizardValuesToWrite(stepValues, fieldDefs ?? {})
      if (Object.keys(writeVals).length > 0) {
        await callKw(model, 'write', [[wizardId], writeVals], { context: wizardContext })
      }
      if (button.special === 'cancel' || button.special === 'close') return
      return callKw(model, button.name, [[wizardId]], { context: wizardContext })
    },
    onSuccess: (_, { button }) => {
      if (button.special === 'cancel' || button.special === 'close') {
        onCancel()
        return
      }
      if (stepIndex < steps.length - 1) {
        setStepIndex((i) => i + 1)
      } else {
        onDone()
      }
    },
    onError: (err: Error) => {
      toast.error(err.message.replace(/^Odoo Error:\s*/, ''))
    },
  })

  const handleFieldChange = useCallback((field: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
          <h3 className="text-sm font-semibold text-text-primary">{step.title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-text-muted hover:text-text-primary"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4">
          {createError ? (
            <p className="text-sm text-danger">{createError}</p>
          ) : isCreating || isLoadingFields || !wizardId ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-3">
              {step.fields.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  Confirm to continue with the current record context.
                </p>
              ) : null}
              {step.fields.map((fieldName) => {
                const fieldDef = fieldDefs?.[fieldName]
                return (
                  <label key={fieldName} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-text-secondary">
                      {fieldDef?.string || fieldName}
                    </span>
                    <WizardFieldInput
                      fieldName={fieldName}
                      fieldDef={fieldDef}
                      value={values[fieldName] ?? ''}
                      onChange={handleFieldChange}
                    />
                  </label>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-between border-t border-border-subtle px-5 py-3">
          <div>
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex((i) => i - 1)}
                className="rounded-md px-3 py-1.5 text-xs text-text-secondary hover:bg-hover hover:text-text-primary"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {step.buttons.map((btn) => (
              <button
                key={btn.name}
                type="button"
                onClick={() => stepMutation.mutate({ button: btn, stepValues: values })}
                disabled={stepMutation.isPending || !wizardId || !!createError}
                className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                  btn.special === 'cancel'
                    ? 'border border-border-default text-text-secondary hover:bg-hover'
                    : 'bg-accent text-white hover:bg-accent/90'
                }`}
              >
                {stepMutation.isPending ? '...' : btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
