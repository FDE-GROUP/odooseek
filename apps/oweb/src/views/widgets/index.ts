import type { FieldElement } from '@odooseek/odoo-client'

/** Stable no-op callback — avoids creating new function references on every render. */
export const NOOP = () => {}

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
import { BinaryWidget, ImageFieldWidget } from './media'
import { OrgChartWidget } from './OrgChart'
import { PresenceIcon } from './PresenceIcon'
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
  AttachmentImageWidget,
  BadgeSelectionWidget,
  BinaryWidget,
  BooleanFavoriteWidget,
  BooleanIconWidget,
  BooleanToggleWidget,
  BooleanWidget,
  CharWidget,
  ColorPickerWidget,
  CopyClipboardWidget,
  DatetimeWidget,
  DateWidget,
  EmailWidget,
  FloatTimeWidget,
  FloatWidget,
  HandleWidget,
  HtmlWidget,
  ImageFieldWidget,
  ImageUrlWidget,
  IntegerWidget,
  LabelSelectionWidget,
  Many2ManyCheckboxesWidget,
  Many2ManyTagsAvatarWidget,
  Many2ManyTagsWidget,
  Many2ManyWidget,
  Many2OneAvatarWidget,
  Many2OneWidget,
  MonetaryWidget,
  One2ManyWidget,
  OrgChartWidget,
  PercentageWidget,
  PercentPieWidget,
  PhoneWidget,
  PresenceIcon,
  PriorityWidget,
  ProgressbarWidget,
  RadioWidget,
  RemainingDaysWidget,
  SelectionWidget,
  StateBadgeWidget,
  StateSelectionWidget,
  StatusbarWidget,
  TextWidget,
  UrlWidget,
  VersionTimeline,
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
  priority: PriorityWidget,
  state: StateBadgeWidget,
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
  // HR
  presence_icon: PresenceIcon,
  org_chart: OrgChartWidget,
  version_timeline: VersionTimeline,
}

export function getFieldWidget(
  field: FieldElement,
  type: string,
): React.ComponentType<FieldWidgetProps> {
  // widget attribute from XML arch overrides type-based selection
  if (field.widget && WIDGET_OVERRIDES[field.widget]) {
    return WIDGET_OVERRIDES[field.widget]
  }
  if (field.widget && TYPE_WIDGETS[field.widget]) {
    return TYPE_WIDGETS[field.widget]
  }
  return TYPE_WIDGETS[type] ?? CharWidget
}
