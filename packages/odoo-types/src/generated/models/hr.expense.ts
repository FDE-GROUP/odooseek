// Auto-generated from hr.expense (Odoo fields_get)
// DO NOT EDIT — run `bun run generate` in @odooseek/odoo-codegen to regenerate

import type { BaseRecord, ModelFieldName, ModelRecord } from '../core'

/** hr.expense */
export interface HrExpenseRecord extends BaseRecord {
  /** Account — An expense account is expected */
  account_id: [number, string] /* account.account */ | false
  /** Journal Entry */
  account_move_id: [number, string] /* account.move */ | false
  /** Next Activity Calendar Event */
  activity_calendar_event_id: [number, string] /* calendar.event */ | false
  /** Next Activity Deadline */
  activity_date_deadline: string | false
  /** Activity Exception Decoration — Type of the exception activity on record. */
  activity_exception_decoration: 'warning' | 'danger' | false
  /** Icon — Icon to indicate an exception activity. */
  activity_exception_icon: string | false
  /** Activities */
  activity_ids: number[] /* mail.activity */
  /** Activity State — Status based on activities
Overdue: Due date is already passed
Today: Activity date is today
Planned: Future activities. */
  activity_state: 'overdue' | 'today' | 'planned' | false
  /** Next Activity Summary */
  activity_summary: string | false
  /** Activity Type Icon — Font awesome icon e.g. fa-tasks */
  activity_type_icon: string | false
  /** Next Activity Type */
  activity_type_id: [number, string] /* mail.activity.type */ | false
  /** Responsible User */
  activity_user_id: [number, string] /* res.users */ | false
  /** Amount Due */
  amount_residual: number | false
  /** Analytic Distribution */
  analytic_distribution: unknown | false
  /** Analytic Precision */
  analytic_precision: number | false
  /** Approval Date */
  approval_date: string | false
  /** Approval State */
  approval_state: 'submitted' | 'approved' | 'refused' | false
  /** Attachments */
  attachment_ids: number[] /* ir.attachment */
  /** Can Approve */
  can_approve: boolean
  /** Can be reinvoiced */
  can_be_reinvoiced: boolean
  /** Can Reset */
  can_reset: boolean
  /** Report Company Currency */
  company_currency_id: [number, string] /* res.currency */ | false
  /** Company */
  company_id: [number, string] /* res.company */
  /** Created on */
  create_date: string | false
  /** Created by */
  create_uid: [number, string] /* res.users */ | false
  /** Currency */
  currency_id: [number, string] /* res.currency */
  /** Currency Rate */
  currency_rate: number | false
  /** Expense Date */
  date: string | false
  /** Department */
  department_id: [number, string] /* hr.department */ | false
  /** Internal Notes */
  description: string | false
  /** Distribution Analytic Account */
  distribution_analytic_account_ids: number[] /* account.analytic.account */ | false
  /** Duplicate Expense */
  duplicate_expense_ids: number[] /* hr.expense */ | false
  /** Employee */
  employee_id: [number, string] /* hr.employee */
  /** Former Report */
  former_sheet_id: number | false
  /** Has Message */
  has_message: boolean
  /** Is Editable By Current User */
  is_editable: boolean
  /** Is currency_id different from the company_currency_id */
  is_multiple_currency: boolean
  /** Journal */
  journal_id: [number, string] /* account.journal */ | false
  /** Label Currency Rate */
  label_currency_rate: string | false
  /** Manager */
  manager_id: [number, string] /* res.users */ | false
  /** Attachment Count */
  message_attachment_count: number | false
  /** Followers */
  message_follower_ids: number[] /* mail.followers */
  /** Message Delivery error — If checked, some messages have a delivery error. */
  message_has_error: boolean
  /** Number of errors — Number of messages with delivery error */
  message_has_error_counter: number | false
  /** SMS Delivery error — If checked, some messages have a delivery error. */
  message_has_sms_error: boolean
  /** Messages */
  message_ids: number[] /* mail.message */
  /** Is Follower */
  message_is_follower: boolean
  /** Checksum/SHA1 */
  message_main_attachment_checksum: string | false
  /** Main Attachment */
  message_main_attachment_id: [number, string] /* ir.attachment */ | false
  /** Action Needed — If checked, new messages require your attention. */
  message_needaction: boolean
  /** Number of Actions — Number of messages requiring action */
  message_needaction_counter: number | false
  /** Followers (Partners) */
  message_partner_ids: number[] /* res.partner */ | false
  /** My Activity Deadline */
  my_activity_date_deadline: string | false
  /** Description */
  name: string
  /** Number of Attachments */
  nb_attachment: number | false
  /** Payment Method — The payment method used when the expense is paid by the company. */
  payment_method_line_id: [number, string] /* account.payment.method.line */ | false
  /** Paid By */
  payment_mode: 'own_account' | 'company_account'
  /** Unit Price */
  price_unit: number
  /** Product Description */
  product_description: string | false
  /** Product Has Cost */
  product_has_cost: boolean
  /** Whether tax is defined on a selected product */
  product_has_tax: boolean
  /** Category */
  product_id: [number, string] /* product.product */ | false
  /** Unit */
  product_uom_id: [number, string] /* uom.uom */ | false
  /** Quantity */
  quantity: number
  /** Ratings */
  rating_ids: number[] /* rating.rating */
  /** Customer to Reinvoice — If the category has an expense policy, it will be reinvoiced on this sales order */
  sale_order_id: [number, string] /* sale.order */ | false
  /** Sale Order Line */
  sale_order_line_id: [number, string] /* sale.order.line */ | false
  /** Same Receipt Expense */
  same_receipt_expense_ids: number[] /* hr.expense */ | false
  /** Selectable Payment Method Line */
  selectable_payment_method_line_ids: number[] /* account.payment.method.line */ | false
  /** Origin Split Expense — Original expense from a split. */
  split_expense_origin_id: [number, string] /* hr.expense */ | false
  /** Status */
  state: 'draft' | 'submitted' | 'approved' | 'posted' | 'in_payment' | 'paid' | 'refused' | false
  /** Tax amount — Tax amount in company currency */
  tax_amount: number | false
  /** Tax amount in Currency — Tax amount in currency */
  tax_amount_currency: number | false
  /** Included taxes — Both price-included and price-excluded taxes will behave as price-included taxes for expenses. */
  tax_ids: number[] /* account.tax */ | false
  /** Total */
  total_amount: number | false
  /** Total In Currency */
  total_amount_currency: number | false
  /** Total Untaxed Amount */
  untaxed_amount: number | false
  /** Total Untaxed Amount In Currency */
  untaxed_amount_currency: number | false
  /** Vendor */
  vendor_id: [number, string] /* res.partner */ | false
  /** Website Messages — Website communication history */
  website_message_ids: number[] /* mail.message */
  /** Last Updated on */
  write_date: string | false
  /** Last Updated by */
  write_uid: [number, string] /* res.users */ | false
}

/** Field names for hr.expense */
export type HrExpenseFieldName = ModelFieldName<HrExpenseRecord>

/** Typed search_read result */
export type HrExpenseSearchResult = ModelRecord<HrExpenseRecord>
