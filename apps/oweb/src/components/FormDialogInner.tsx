import type { OdooAction, OdooFieldMeta } from '@odooseek/odoo-client'
import { forwardRef, useCallback } from 'react'
import { OdooFormRenderer, type OdooFormRendererRef } from '../views/OdooFormRenderer'

export interface FormDialogInnerProps {
  model: string
  arch: string
  fields: Record<string, OdooFieldMeta>
  recordId?: number
  context?: Record<string, unknown>
  onClose: () => void
}

export const FormDialogInner = forwardRef<OdooFormRendererRef, FormDialogInnerProps>(
  function FormDialogInner({ model, arch, fields, recordId, context, onClose }, ref) {
    const handleAction = useCallback(
      (act: OdooAction) => {
        if (act.type === 'ir.actions.act_window_close') {
          onClose()
        }
      },
      [onClose],
    )

    return (
      <OdooFormRenderer
        ref={ref}
        model={model}
        arch={arch}
        fields={fields}
        recordId={recordId}
        context={context}
        onAction={handleAction}
      />
    )
  },
)
