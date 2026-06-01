import { callKw } from '@odooseek/odoo-client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

interface WizardField {
  name: string
  type: string
  string: string
  required?: boolean
  selection?: [string, string][]
  relation?: string
}

interface WizardStep {
  title: string
  fields: string[]
  buttons: WizardButton[]
}

interface WizardButton {
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

export function WizardDialog({
  open,
  model,
  context = {},
  steps,
  onDone,
  onCancel,
}: WizardDialogProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [wizardId, setWizardId] = useState<number | null>(null)

  // Create wizard record on open
  const { isLoading: isCreating } = useQuery({
    queryKey: ['odoo', 'wizard', model, 'create'],
    queryFn: () =>
      callKw<number>(model, 'create', [{ ...context }], {}).then((id) => {
        setWizardId(id as number)
        return id
      }),
    enabled: open && wizardId === null,
  })

  // Fetch current step fields
  const step = steps[stepIndex]
  const { data: fieldDefs, isLoading: isLoadingFields } = useQuery({
    queryKey: ['odoo', 'wizard', model, 'fields', wizardId],
    queryFn: () =>
      callKw<Record<string, WizardField>>(model, 'fields_get', [[], []], {}).catch(
        () => ({}) as Record<string, WizardField>,
      ),
    enabled: !!wizardId && stepIndex === 0,
  })

  const stepMutation = useMutation({
    mutationFn: async ({
      button,
      values: stepValues,
    }: {
      button: WizardButton
      values: Record<string, unknown>
    }) => {
      if (!wizardId) return
      return callKw(model, button.name, [[wizardId], stepValues], {})
    },
    onSuccess: (_, { button }) => {
      if (button.special === 'cancel' || button.special === 'close') {
        onCancel()
        return
      }
      // Advance to next step
      if (stepIndex < steps.length - 1) {
        setStepIndex(stepIndex + 1)
      } else {
        onDone()
      }
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
          {isCreating || isLoadingFields ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-3">
              {step.fields.map((fieldName) => {
                const fieldDef = fieldDefs?.[fieldName]
                const value = values[fieldName] ?? ''
                const isSelection = fieldDef?.type === 'selection'

                return (
                  <label key={fieldName} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-text-secondary">
                      {fieldDef?.string || fieldName}
                    </span>
                    {isSelection && fieldDef?.selection ? (
                      <select
                        value={String(value)}
                        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                        className="rounded-md border border-border-default bg-root px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                      >
                        <option value="" />
                        {fieldDef.selection.map((entry: [string, string]) => (
                          <option key={entry[0]} value={entry[0]}>
                            {entry[1]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={String(value)}
                        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                        className="rounded-md border border-border-default bg-root px-2 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                        required={fieldDef?.required}
                      />
                    )}
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
                onClick={() => setStepIndex(stepIndex - 1)}
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
                onClick={() => stepMutation.mutate({ button: btn, values })}
                disabled={stepMutation.isPending}
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

export type { WizardButton, WizardStep }
