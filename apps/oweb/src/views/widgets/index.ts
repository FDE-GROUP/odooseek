import type { FieldElement } from '@odooseek/odoo-client'
import { AnalyticDistributionWidget } from './analytic-distribution'
import { BackgroundImageWidget } from './BackgroundImage'
import { BadgeWidget } from './BadgeWidget'
import { BadgeSelectionFilterWidget } from './badge-selection-filter'
import {
  BooleanToggleWidget,
  BooleanWidget,
  CharWidget,
  DatetimeWidget,
  DateWidget,
  FloatTimeWidget,
  FloatWidget,
  HtmlWidget,
  IntegerWidget,
  MonetaryWidget,
  PercentageWidget,
  TextWidget,
} from './basic'
import { CodeEditorWidget } from './code-editor'
import { DaterangeWidget } from './daterange'
import { DomainWidget } from './domain'
import { FieldSelectorWidget } from './field-selector'
import { FilterableSelectionWidget } from './filterable-selection'
import { FloatFactorWidget } from './float-factor'
import { GaugeWidget, StatInfoWidget } from './gauge-statinfo'
import { JsonCheckboxesWidget, JsonWidget } from './json-widgets'
import { Many2ManyAvatarUserWidget } from './many2many-avatar'
import { Many2ManyBinaryWidget } from './many2many-binary'
import { BinaryWidget, ImageFieldWidget } from './media'
import {
  ActivityExceptionWidget,
  Many2ManyTaxTagsWidget,
  UpgradeBooleanWidget,
} from './misc-widgets'
import { OrgChartWidget } from './OrgChart'
import { PresenceIcon } from './PresenceIcon'
import { DynamicSelectionWidget, ProjectTaskStateWidget } from './phaseB-widgets'
import { PlsTooltipWidget } from './pls-tooltip'
import { PropertiesWidget } from './properties'
import {
  AttachmentImageWidget,
  Many2ManyCheckboxesWidget,
  Many2ManyTagsAvatarWidget,
  Many2ManyWidget,
  Many2OneAvatarWidget,
  Many2OneWidget,
  One2ManyWidget,
} from './relational'
import {
  BadgeSelectionWidget,
  LabelSelectionWidget,
  PriorityWidget,
  RadioWidget,
  SelectionWidget,
  StateBadgeWidget,
  StateSelectionWidget,
  StatusbarWidget,
} from './selection'
import { SignatureWidget } from './signature'
import { Many2OneUomWidget, TimesheetUomWidget } from './uom-widgets'
import {
  BooleanFavoriteWidget,
  BooleanIconWidget,
  ColorPickerWidget,
  CopyClipboardWidget,
  EmailWidget,
  HandleWidget,
  ImageUrlWidget,
  KanbanActivityWidget,
  Many2ManyTagsWidget,
  PercentPieWidget,
  PhoneWidget,
  ProgressbarWidget,
  RemainingDaysWidget,
  RottingWidget,
  UrlWidget,
  WebRibbonWidget,
} from './utility'
import { VersionTimeline } from './VersionTimeline'
import { WebsiteRedirectWidget } from './website-redirect'

/** Stable no-op callback — avoids creating new function references on every render. */
export const NOOP = () => {}

export interface FieldWidgetProps {
  field: FieldElement
  value: unknown
  onChange: (value: unknown) => void
  readOnly?: boolean
  meta?: { selection?: [string, string][]; type?: string; relation?: string; domain?: unknown }
  record?: Record<string, unknown>
  model?: string
  recordId?: number
}

// Odoo 19 style: edit mode = bottom border only, read-only = plain text
export const FIELD_INPUT_CLASS =
  'w-full border-0 border-b border-border-default bg-transparent px-1 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none'

// Re-export all widget components for direct use
export {
  ActivityExceptionWidget,
  AnalyticDistributionWidget,
  AttachmentImageWidget,
  BadgeSelectionFilterWidget,
  BadgeSelectionWidget,
  BadgeWidget,
  BinaryWidget,
  BooleanFavoriteWidget,
  BooleanIconWidget,
  BooleanToggleWidget,
  BooleanWidget,
  CharWidget,
  CodeEditorWidget,
  ColorPickerWidget,
  CopyClipboardWidget,
  DaterangeWidget,
  DatetimeWidget,
  DateWidget,
  DomainWidget,
  DynamicSelectionWidget,
  EmailWidget,
  FieldSelectorWidget,
  FilterableSelectionWidget,
  FloatFactorWidget,
  FloatTimeWidget,
  FloatWidget,
  GaugeWidget,
  HandleWidget,
  HtmlWidget,
  ImageFieldWidget,
  ImageUrlWidget,
  IntegerWidget,
  JsonCheckboxesWidget,
  JsonWidget,
  KanbanActivityWidget,
  LabelSelectionWidget,
  Many2ManyAvatarUserWidget,
  Many2ManyBinaryWidget,
  Many2ManyCheckboxesWidget,
  Many2ManyTagsAvatarWidget,
  Many2ManyTagsWidget,
  Many2ManyTaxTagsWidget,
  Many2ManyWidget,
  Many2OneAvatarWidget,
  Many2OneUomWidget,
  Many2OneWidget,
  MonetaryWidget,
  One2ManyWidget,
  OrgChartWidget,
  PercentageWidget,
  PercentPieWidget,
  PhoneWidget,
  PlsTooltipWidget,
  PresenceIcon,
  PriorityWidget,
  ProgressbarWidget,
  ProjectTaskStateWidget,
  PropertiesWidget,
  RadioWidget,
  RemainingDaysWidget,
  RottingWidget,
  SelectionWidget,
  SignatureWidget,
  StateBadgeWidget,
  StateSelectionWidget,
  StatInfoWidget,
  StatusbarWidget,
  TextWidget,
  TimesheetUomWidget,
  UpgradeBooleanWidget,
  UrlWidget,
  VersionTimeline,
  WebsiteRedirectWidget,
}

// ── Widget Registry ─────────────────────────────────────────────────

export const TYPE_WIDGETS: Record<string, React.ComponentType<FieldWidgetProps>> = {
  char: CharWidget,
  text: TextWidget,
  integer: IntegerWidget,
  float: FloatWidget,
  monetary: MonetaryWidget,
  boolean: BooleanWidget,
  date: DateWidget,
  datetime: DatetimeWidget,
  selection: SelectionWidget,
  many2one: Many2OneWidget,
  many2many: Many2ManyWidget,
  one2many: One2ManyWidget,
  binary: BinaryWidget,
  image: BinaryWidget,
  html: HtmlWidget,
  reference: Many2OneWidget,
}

const WIDGET_OVERRIDES: Record<string, React.ComponentType<FieldWidgetProps>> = {
  priority: PriorityWidget,
  state: StateBadgeWidget,
  statusbar: StatusbarWidget,
  boolean_toggle: BooleanToggleWidget,
  many2one_avatar: Many2OneAvatarWidget,
  email: EmailWidget,
  phone: PhoneWidget,
  url: UrlWidget,
  many2many_tags: Many2ManyTagsWidget,
  many2many: Many2ManyTagsWidget,
  handle: HandleWidget,
  color_picker: ColorPickerWidget,
  progressbar: ProgressbarWidget,
  attachment_image: AttachmentImageWidget,
  // Phase 24
  radio: RadioWidget,
  many2many_checkboxes: Many2ManyCheckboxesWidget,
  many2many_tags_avatar: Many2ManyTagsAvatarWidget,
  // Phase 25
  float_time: FloatTimeWidget,
  percentage: PercentageWidget,
  selection_badge: BadgeSelectionWidget,
  BadgeWidget,
  label_selection: LabelSelectionWidget,
  state_selection: StateSelectionWidget,
  // Phase 26
  boolean_favorite: BooleanFavoriteWidget,
  boolean_icon: BooleanIconWidget,
  copy_clipboard: CopyClipboardWidget,
  remaining_days: RemainingDaysWidget,
  image_url: ImageUrlWidget,
  percentpie: PercentPieWidget,
  contact_image: ImageFieldWidget,
  web_ribbon: WebRibbonWidget,
  kanban_activity: KanbanActivityWidget,
  rotting: RottingWidget,
  signature: SignatureWidget,
  daterange: DaterangeWidget,
  properties: PropertiesWidget,
  lead_properties: PropertiesWidget,
  task_properties: PropertiesWidget,
  // HR
  background_image: BackgroundImageWidget,
  presence_icon: PresenceIcon,
  org_chart: OrgChartWidget,
  version_timeline: VersionTimeline,
  badge_print: BadgeWidget,
  // New widgets (issue #243-#245)
  filterable_selection: FilterableSelectionWidget,
  float_factor: FloatFactorWidget,
  gauge: GaugeWidget,
  statinfo: StatInfoWidget,
  selection_badge_with_filter: BadgeSelectionFilterWidget,
  domain: DomainWidget,
  ace: CodeEditorWidget,
  code: CodeEditorWidget,
  many2many_binary: Many2ManyBinaryWidget,
  many2many_avatar_user: Many2ManyAvatarUserWidget,
  many2many_tax_tags: Many2ManyTaxTagsWidget,
  timesheet_uom: TimesheetUomWidget,
  many2one_uom: Many2OneUomWidget,
  upgrade_boolean: UpgradeBooleanWidget,
  activity_exception: ActivityExceptionWidget,
  dynamic_selection: DynamicSelectionWidget,
  project_task_state_selection: ProjectTaskStateWidget,
  analytic_distribution: AnalyticDistributionWidget,
  website_redirect_button: WebsiteRedirectWidget,
  pls_tooltip_button: PlsTooltipWidget,
  field_selector: FieldSelectorWidget,
  json: JsonWidget,
  json_checkboxes: JsonCheckboxesWidget,
  account_json_checkboxes: JsonCheckboxesWidget,
}

const WIDGET_ALIASES: Record<string, keyof typeof WIDGET_OVERRIDES> = {
  hr_presence_status: 'presence_icon',
  hr_icon_display: 'presence_icon',
  hr_org_chart: 'org_chart',
  hr_department_chart: 'org_chart',
  hr_version_timeline: 'version_timeline',
  versions_timeline: 'version_timeline',
  employee_badge: 'badge_print',
  hr_employee_badge: 'badge_print',
  // HR field widgets from employee form
  many2many_tags_salary_bank: 'many2many_tags',
  work_permit_upload: 'binary',
  many2many_avatar_employee_field: 'many2many',
  image_1920: 'contact_image',
  employee_properties: 'properties',
  kanban_employee_avatar: 'many2one_avatar',
  // Odoo 19 high-frequency aliases
  many2one_avatar_user: 'many2one_avatar',
  many2one_avatar_employee: 'many2one_avatar',
  many2one_avatar_resource: 'many2one_avatar',
  res_partner_many2one: 'many2one',
  many2one_barcode: 'many2one',
  many2many_tags_avatar_popover: 'many2many_tags_avatar',
  CopyClipboardChar: 'copy_clipboard',
  CopyClipboardURL: 'copy_clipboard',
  CopyClipboardButton: 'copy_clipboard',
  list_activity: 'kanban_activity',
  badge: 'selection_badge',
  badge_selection: 'selection_badge',
  formatte_date: 'date',
  boolean_radio: 'radio',
  float_toggle: 'boolean_toggle',
  image_radio: 'radio',
  boolean_toggle_confirm: 'boolean_toggle',
  checkbox: 'boolean',
  color: 'color_picker',
  kanban_color_picker: 'color_picker',
  rotting_statusbar_duration: 'statusbar',
  section_and_note_text: 'text',
  // CRM
  many2one_avatar_leader_user: 'many2one_avatar',
  badge_rotting: 'selection_badge',
  // Phase F
  timesheet_uom_no_toggle: 'timesheet_uom',
  many2many_avatar_employee: 'many2many_avatar_user',
  website_redirect: 'website_redirect_button',
  // Event module
  event_state_selection: 'state_selection',
  event_icon_selection: 'selection',
  EventMailTemplateReferenceField: 'many2one',
  // Stock module
  forecast_widget: 'gauge',
  counted_quantity_widget: 'float',
  stock_action_field: 'statinfo',
  package_m2o: 'many2one',
  package_m2m: 'many2many_tags',
  pick_from: 'many2one',
  sml_x2_many: 'one2many',
  move_product_label_field: 'many2one',
  stock_rescheduling_popover: 'many2one',
  many2many_barcode_tags: 'many2many_tags',
  picking_type_dashboard_graph: 'gauge',
  stock_move_one2many: 'one2many',
  popover_widget: 'many2one',
  stock_forced_placeholder: 'char',
  generate_serials: 'text',
  import_lots: 'text',
  // Account module
  account_type_selection: 'selection',
  many2many_tax_tags: 'many2many_tags',
  open_move_widget: 'many2one',
  line_open_move_widget: 'many2one',
  analytic_distribution: 'many2one',
  receipt_selector: 'selection',
  account_move_statusbar_secured: 'statusbar',
  invoice_payments_widget: 'many2one',
  x2many_buttons: 'many2one',
  actionable_errors: 'many2one',
  many2many_tags_banks: 'many2many_tags',
  account_tax_repartition_line_factor_percent: 'float',
  // Sale module
  sol_o2m: 'one2many',
  sol_product_many2one: 'many2one',
  sol_text: 'text',
  'account-tax-totals-field': 'text',
  // CRM module — extras not already in aliases
  open_match_line_widget: 'many2one',
  monetary_no_zero: 'monetary',
  // Purchase module
  purchase_file_uploader: 'binary',
  product_label_section_and_note_field: 'many2one',
  product_label_section_and_note_field_o2m: 'one2many',
  toaster_button: 'many2one',
  // Project module
  project_is_favorite: 'boolean_favorite',
  project_state_selection: 'state_selection',
  status_with_color: 'selection_badge',
  name_with_subtask_count: 'many2one',
  statusbar_duration: 'statusbar',
  // MRP module
  mrp_timer: 'float',
  mrp_workorder_popover: 'many2one',
  mrp_remaining_days_unformatted: 'remaining_days',
  mrp_should_consume: 'boolean',
  // Calendar module
  many2manyattendee: 'many2many_tags',
  many2manyattendeeexpandable: 'many2many_tags',
  calendar_week_days: 'many2many_checkboxes',
  calendar_event_notes_html: 'text',
  // HR Holidays / Time Off
  hr_holidays_radio_image: 'image_url',
  float_time_selection: 'float_time',
  day_selection: 'selection',
  float_without_trailing_zeros: 'float',
  // Helpdesk
  helpdesk_sla_many2many_tags: 'many2many_tags',
  helpdesk_smiley_badge: 'selection_badge',
  // Survey
  radio_selection_with_filter: 'radio',
  boolean_update_flag: 'boolean',
  integer_update_flag: 'integer',
  // POS
  many2many_tags_placeholder_list_view: 'many2many_tags',
  section_one2many: 'one2many',
  // Payroll
  hr_payroll_status_bubble: 'selection_badge',
  actionable_warnings: 'selection_badge',
  formatted_text_preview: 'text',
  salary_attachment_2many: 'many2many',
  payrun_binary: 'binary',
  // Lunch
  lunch_is_favorite: 'boolean_favorite',
  // Knowledge
  knowledge_html: 'text',
  knowledge_icon: 'selection',
  char_emojis: 'text',
  text_emojis: 'text',
  // Documents
  document_favorite: 'boolean_favorite',
  document_size: 'text',
  documents_folder_many2one: 'many2one',
  documents_kanban_activity: 'kanban_activity',
  documents_type_icon: 'selection',
  // Sign
  sign_request_documents_dropdown: 'many2one',
  // Mass Mailing
  mass_mailing_html: 'text',
  // Social
  social_post_formatter: 'text',
  social_many2many_images: 'many2many',
  // Website
  page_url: 'url',
  // SMS / WhatsApp / VoIP
  sms_widget: 'text',
  whatsapp_text_variables: 'text',
  voip_call_status_badge: 'selection_badge',
  voip_flag_phone: 'boolean',
  voip_simple_datetime: 'date',
  // Stock Barcode
  barcode_handler: 'char',
  image_preview: 'binary',
  stock_barcode_quant_one2many: 'one2many',
  // HR Work Entry
  many2one_work_entry_type: 'many2one',
  // Account misc
  account_report_lines_list_x2many: 'one2many',
  account_audit_progressbar: 'progressbar',
  account_return_name_badge: 'selection_badge',
  account_return_selection_badge: 'selection_badge',
  open_decimal_precision_button: 'many2one',
  autosave_many2many_tax_tags: 'many2many_tags',
  char_with_placeholder_field: 'char',
  char_with_placeholder_field_to_check: 'char',
  // HR misc
  hr_homeworking_radio_image: 'radio',
  // Project misc
  task_done_checkmark: 'boolean',
  task_stage_with_state_selection: 'selection',
  timer_start_field: 'float',
  // Marketing Automation
  mailing_filter: 'many2one',
  mailing_many2one: 'many2one',
  subscription_graph: 'gauge',
  marketing_activity_graph: 'gauge',
  // Appraisal
  appraisal_percentpie: 'percentpie',
  appraisal_remaining_days: 'remaining_days',
  // Referral
  CopyClipboardReferralButton: 'copy_clipboard',
  referral_many2one_avatar_user: 'many2one_avatar',
  // Skills
  many2many_tags_skills: 'many2many_tags',
  many2one_tags_skills: 'many2one',
  skills_one2many: 'one2many',
  resume_one2many: 'one2many',
  formatted_date: 'date',
  boolean_toggle_load: 'boolean_toggle',
  // Purchase misc
  pol_product_many2one: 'many2one',
}

function resolveWidgetOverride(
  widgetName?: string,
): React.ComponentType<FieldWidgetProps> | undefined {
  if (!widgetName) return undefined
  const direct = WIDGET_OVERRIDES[widgetName]
  if (direct) return direct
  const aliasKey = WIDGET_ALIASES[widgetName]
  if (aliasKey) return WIDGET_OVERRIDES[aliasKey]
  return undefined
}

export function getFieldWidget(
  field: FieldElement,
  type: string,
): React.ComponentType<FieldWidgetProps> {
  const override = resolveWidgetOverride(field.widget)
  if (override) return override
  if (field.widget && TYPE_WIDGETS[field.widget]) {
    return TYPE_WIDGETS[field.widget]
  }
  return TYPE_WIDGETS[type] ?? CharWidget
}
