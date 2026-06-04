/**
 * js_class → React component mapping.
 *
 * Strategy: Map Odoo OWL js_class values to React renderers.
 * - Component path → custom React component
 * - null → fallback to generic view renderer
 * - undefined → not yet mapped (same as null for now)
 */
import type { OdooFieldMeta } from '@odooseek/odoo-client'
import { type ComponentType, lazy } from 'react'

export interface JsClassHandlerProps {
  model: string
  arch: string
  fields: Record<string, OdooFieldMeta>
  domain: unknown[]
  groupBy?: string[]
  recordId?: number
  context?: Record<string, unknown>
}

type JsClassLoader = () => Promise<{ default: ComponentType<JsClassHandlerProps> }>

export const JS_CLASS_MAP: Record<string, null | JsClassLoader> = {
  // ── Calendar ──────────────────────────────────────
  attendee_calendar: null, // OdooCalendarRenderer handles this generically
  calendar_form: null, // OdooFormRenderer handles this generically
  calendar_list_view: null, // OdooListRenderer handles this generically
  calendar_quick_create_form_view: null, // CalendarQuickCreate handles this
  calendar_with_recurrence: null, // RecurrenceUpdateDialog handles this

  // ── Event ─────────────────────────────────────────
  event_slot_calendar: null, // OdooCalendarRenderer + multi_create handles this
  event_configurator_form: null,
  event_booth_configurator_form: null,
  registration_summary_dialog_list: null, // RegistrationDesk handles this
  registration_summary_dialog_kanban: null, // RegistrationDesk handles this

  // ── HR ────────────────────────────────────────────
  hr_employee_form: null, // OdooFormRenderer handles this
  hr_employee_list: null, // OdooListRenderer handles this
  hr_employee_hierarchy: null, // OdooHierarchyRenderer handles this
  hr_employee_selection_list: null, // generic list fallback
  hr_expense_form_view: null,
  hr_expense_kanban: null,
  hr_expense_tree: null,

  // ── Stock ─────────────────────────────────────────
  stock_list_view: null, // OdooListRenderer handles this
  stock_dashboard_kanban: () => import('../views/kanban/StockDashboardKanban'),
  stock_report_list_view: null,
  stock_orderpoint_list: null,
  stock_add_package_list_view: null,
  inventory_report_list: null,
  stock_barcode_list_kanban: null,
  stock_barcode_sml_form: null,
  stock_map: null,
  stock_forecasted_graph: null,
  rotting_kanban: null,

  // ── Account ───────────────────────────────────────
  account_dashboard_kanban: null,
  account_tree: null,
  account_documents_kanban: null,
  account_move_form: null,
  account_move_line_reconcile_list: null,
  account_return_kanban: null,
  account_return_audit_kanban: null,
  account_return_check_kanban: null,
  account_325_form_tree: null,
  account_audit_balance_list: null,
  account_duplicate_transactions_form: null,
  accrual_list_view: null,
  audit_report_kanban_controller: null,
  bank_rec_list: null,
  bank_rec_dialog_list: null,
  bank_rec_widget_kanban: null,
  bankrec_edit_line: null,
  transient_bank_statement_line_list_view: null,

  // ── Account / Extract ────────────────────────────
  extract_sample_form: null,

  // ── CRM ───────────────────────────────────────────
  crm_form: null,
  crm_kanban: null,
  crm_team_form: null,
  forecast_graph: null,
  forecast_pivot: null,

  // ── Sale ──────────────────────────────────────────
  // (no js_class entries found for Sale in CE)

  // ── Purchase ──────────────────────────────────────
  purchase_dashboard_kanban: null,
  purchase_dashboard_list: null,
  purchase_order_line_compare: null,

  // ── MRP ───────────────────────────────────────────
  mrp_employee_tree: null,
  mrp_workorder_gantt: null,

  // ── Project ───────────────────────────────────────
  project_project_form: null,
  project_project_kanban: null,
  project_project_list: null,
  project_project_calendar: null,
  project_project_activity: null,
  project_task_form: null,
  project_task_kanban: null,
  project_task_calendar: null,
  project_task_activity: null,
  project_task_graph: null,
  project_task_pivot: null,
  project_task_map: null,
  project_task_analysis_graph: null,
  project_task_analysis_pivot: null,
  project_gantt: null,
  project_update_kanban: null,
  project_update_list: null,
  task_gantt: null,
  task_sharing_gantt: null,
  todo_form: null,
  todo_list: null,
  todo_conversion_form: null,
  todo_activity_wizard: null,
  subscription_graph: null,
  burndown_chart: null,

  // ── Recruitment ──────────────────────────────────
  recruitment_kanban_view: null,
  recruitment_report_pivot: null,
  recruitment_report_view_graph: null,

  // ── HR Attendance ─────────────────────────────────
  attendance_list_view: null,
  attendance_gantt: null,

  // ── HR Holidays / Time Off ─────────────────────────
  hr_gantt: null,
  hr_holidays_gantt: null,
  hr_holidays_gantt_manager: null,
  hr_holidays_gantt_manager_hr_leave: null,
  hr_holidays_graph: null,
  time_off_calendar_dashboard: null,
  time_off_calendar_hr_leave: null,
  time_off_kanban_dashboard: null,
  time_off_report_calendar: null,

  // ── Discuss / LiveChat ────────────────────────────
  'im_livechat.discuss_channel_kanban': null,
  'im_livechat.discuss_channel_list': null,
  'im_livechat.discuss_channel_looking_for_help_kanban': null,
  'im_livechat.discuss_channel_looking_for_help_list': null,
  'im_livechat.livechat_channel_kanban': null,
  'im_livechat.agent_history_graph': null,
  'im_livechat.agent_history_pivot': null,
  'im_livechat.channel_report_graph_views': null,
  'im_livechat.report_channel_pivot': null,
  livechat_session_form: null,
  'whatsapp.discuss_channel_list': null,

  // ── HR Skills ────────────────────────────────────
  skills_graph: null,

  // ── Timesheet ─────────────────────────────────────
  timesheet_grid: null,
  timer_timesheet_grid: null,
  timesheet_calendar: null,
  hr_timesheet_graphview: null,

  // ── Planning ──────────────────────────────────────
  planning_calendar: null,
  planning_form: null,
  planning_gantt: null,
  planning_graph: null,
  planning_kanban: null,
  planning_pivot: null,
  planning_tree: null,
  planning_slot_analysis_graph: null,
  planning_slot_analysis_pivot: null,

  // ── Fleet ─────────────────────────────────────────
  fleet_form: null,

  // ── Helpdesk ──────────────────────────────────────
  helpdesk_ticket_kanban: null,
  helpdesk_ticket_list: null,
  helpdesk_team_form: null,
  helpdesk_team_kanban_view: null,
  helpdesk_ticket_analysis_cohort: null,
  helpdesk_ticket_analysis_graph: null,
  helpdesk_ticket_analysis_pivot: null,
  fsm_task_calendar: null,

  // ── Quality ───────────────────────────────────────
  // (no js_class entries found for quality)

  // ── Maintenance ──────────────────────────────────
  // (no js_class entries found for maintenance)

  // ── Lunch ─────────────────────────────────────────
  lunch_kanban: null,

  // ── Survey ────────────────────────────────────────
  survey_view_kanban: null,
  survey_view_tree: null,

  // ── Sign ──────────────────────────────────────────
  sign_kanban: null,
  sign_list: null,
  sign_activity: null,
  sign_send_request_form: null,

  // ── Documents ─────────────────────────────────────
  documents_kanban: null,
  documents_activity: null,

  // ── Knowledge ─────────────────────────────────────
  knowledge_article_view_form: null,
  knowledge_article_view_tree: null,
  knowledge_article_view_tree_embedded: null,
  knowledge_article_view_kanban_embedded: null,
  knowledge_article_view_calendar_embedded: null,
  knowledge_hierarchy: null,

  // ── Appointment ──────────────────────────────────
  appointment_booking_gantt: null,
  appointment_booking_list: null,
  appointment_share_link_list: null,
  appointment_type_form_view: null,
  appointment_type_kanban: null,
  appointment_type_list: null,
  appointment_type_view_form_custom_share: null,

  // ── POS ───────────────────────────────────────────
  pos_kanban: null,
  pos_config_kanban_view: null,

  // ── Website ───────────────────────────────────────
  website_pages_list: null,
  website_pages_kanban: null,
  website_new_content_form: null,
  website_forum_add_form: null,

  // ── Others ────────────────────────────────────────
  base_settings: null,
  quotation_document_kanban: null,
  subcontracting_portal_move_list_view: null,
  subcontracting_portal_picking_form_view: null,
  referral_kanban: null,
  schedule_gantt: null,
  slide_channel_partner_enroll_tree: null,
  social_post_kanban_view: null,
  social_stream_post_kanban_view: null,
  tour_list: null,
  data_cleaning_list: null,
  data_merge_list: null,
  data_recycle_list: null,
  databases_project_list: null,
  transifex_code_translation_tree: null,
  theme_preview_form: null,
  theme_preview_kanban: null,
  room_booking_gantt: null,
  auth_passkey_key_create_view_form: null,
  fec_import_wizard_form: null,
  pricer_quick_pairing_form: null,
  form_description_expander: null,
  page_properties_dialog_form: null,
  studio_report_kanban: null,
  job_post_no_save_form: null,
  worksheet_validation: null,

  // ── Product ──────────────────────────────────────
  product_list_view: null,
  product_kanban_catalog: null,
  product_documents_kanban: null,

  // ── Mail ─────────────────────────────────────────
  mail_composer_form: null,
  mail_composer_save_template_form: null,
  mail_activity_my_kanban: null,
  activity_calendar: null,

  // ── Payroll ──────────────────────────────────────
  pay_run_calendar: null,
  hr_version_payrun_list: null,
  employee_declaration_list: null,
  payslip_run_kanban: null,
  hr_salary_rule_list: null,
  hr_payslip_batch_form: null,
  hr_payroll_payslip_list: null,
  hr_holidays_payslip_list: null,
  salary_calculator_form_view: null,

  // ── IoT ──────────────────────────────────────────
  iot_device_form: null,
  add_iot_box_wizard: null,
  no_iot_box_found_wizard: null,
  select_printers_wizard: null,

  // ── Analytic Accounting ──────────────────────────
  analytic_graph: null,
  analytic_kanban: null,
  analytic_pivot: null,
  analytic_list: null,
  analytic_line_grid: null,

  // ── Appraisal ────────────────────────────────────
  appraisal_kanban_view: null,
  appraisal_list_view: null,
  appraisal_goal_delete_form: null,
  appraisal_goal_delete_list: null,

  // ── Goals ────────────────────────────────────────
  goal_kanban_view: null,
  goal_list_view: null,

  // ── Approval ─────────────────────────────────────
  approvals_category_kanban: null,

  // ── ESG (Sustainability) ──────────────────────────
  esg_carbon_emission_graph: null,
  esg_carbon_emission_kanban: null,
  esg_carbon_emission_list: null,
  esg_carbon_emission_pivot: null,
  esg_employee_commuting_report_pivot: null,

  // ── Loyalty ──────────────────────────────────────
  loyalty_card_list_view: null,
  loyalty_program_list_view: null,

  // ── Marketing ─────────────────────────────────────
  marketing_campaign_form_view: null,
  marketing_campaign_kanban_view: null,
  marketing_campaign_list_view: null,

  // ── Time Off / Work Entries ──────────────────────
  work_entries_calendar: null,
  work_entries_gantt: null,
}

/** Pre-computed lazy component map (lazy() must be at module level per React rules). */
export const JS_CLASS_COMPONENTS: Record<string, ComponentType<JsClassHandlerProps>> = {}
for (const key of Object.keys(JS_CLASS_MAP)) {
  const loader = JS_CLASS_MAP[key]
  if (typeof loader === 'function') {
    JS_CLASS_COMPONENTS[key] = lazy(loader)
  }
}

/** Check if a js_class has a custom React component handler (non-null). */
export function hasJscClassHandler(jsClass?: string): boolean {
  if (!jsClass) return false
  return jsClass in JS_CLASS_COMPONENTS
}
