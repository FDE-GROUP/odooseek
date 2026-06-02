/** Odoo xml ids for module menu actions (view_mode / views order). */
export const ODOO_ACTION_XML_ID = {
  crm: {
    leads: 'crm.crm_lead_all_leads',
    pipeline: 'crm.crm_lead_opportunities',
  },
  sale: {
    orders: 'sale.action_orders',
  },
  stock: {
    pickings: 'stock.action_picking_tree_all',
  },
  account: {
    moves: 'account.action_move_journal_line',
  },
  contacts: {
    partners: 'contacts.action_contacts',
  },
} as const
