// Re-export from odoo-client (moved there for RecordModel use)
export { normalizeOnchangeValue, normalizeValuesForRpc, validateAllFields } from '@odooseek/odoo-client'

export function isWizardModel(m?: string): boolean {
  return (
    !!m &&
    (m.includes('.wizard') ||
      m === 'crm.lead2opportunity.partner' ||
      m === 'crm.lead.lost' ||
      m === 'crm.merge.opportunity')
  )
}

export function wizardBtn(model: string) {
  if (model === 'crm.lead.lost') return { label: 'Mark Lost', name: 'action_lost_reason_apply' }
  if (model === 'crm.lead2opportunity.partner') return { label: 'Convert', name: 'action_apply' }
  return { label: 'Confirm', name: 'action_apply' }
}
