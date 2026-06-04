import type { Meta, StoryObj } from '@storybook/tanstack-react'
import type { FieldWidgetProps } from '../index'
import {
  ColorPickerWidget,
  CopyClipboardWidget,
  EmailWidget,
  PhoneWidget,
  ProgressbarWidget,
  UrlWidget,
} from '../utility'

const meta: Meta = {
  title: 'Widgets/Utility Fields',
  tags: ['autodocs'],
}

export default meta

const makeField = (name: string) =>
  ({ attributes: { name, type: 'char' } }) as unknown as Parameters<typeof EmailWidget>[0]['field']

function FieldWrapper({
  component: Comp,
  label,
  value,
  readOnly,
  meta,
}: {
  component: React.ComponentType<FieldWidgetProps>
  label: string
  value: unknown
  readOnly?: boolean
  meta?: FieldWidgetProps['meta']
}) {
  return (
    <div className="w-full max-w-md space-y-1">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <Comp
        field={makeField(label)}
        value={value}
        onChange={() => {}}
        readOnly={readOnly}
        meta={meta}
      />
    </div>
  )
}

export const EmailEdit: StoryObj = {
  render: () => <FieldWrapper component={EmailWidget} label="Email" value="user@example.com" />,
}

export const EmailReadOnly: StoryObj = {
  render: () => (
    <FieldWrapper component={EmailWidget} label="Email" value="user@example.com" readOnly />
  ),
}

export const PhoneEdit: StoryObj = {
  render: () => <FieldWrapper component={PhoneWidget} label="Phone" value="+1-555-0123" />,
}

export const PhoneReadOnly: StoryObj = {
  render: () => <FieldWrapper component={PhoneWidget} label="Phone" value="+1-555-0123" readOnly />,
}

export const UrlEdit: StoryObj = {
  render: () => <FieldWrapper component={UrlWidget} label="Website" value="https://example.com" />,
}

export const UrlReadOnly: StoryObj = {
  render: () => (
    <FieldWrapper component={UrlWidget} label="Website" value="https://example.com" readOnly />
  ),
}

export const ProgressComplete: StoryObj = {
  render: () => <FieldWrapper component={ProgressbarWidget} label="Progress" value={100} />,
}

export const ProgressHalf: StoryObj = {
  render: () => <FieldWrapper component={ProgressbarWidget} label="Progress" value={50} />,
}

export const ProgressEmpty: StoryObj = {
  render: () => <FieldWrapper component={ProgressbarWidget} label="Progress" value={0} />,
}

export const CopyClipboard: StoryObj = {
  render: () => (
    <FieldWrapper
      component={CopyClipboardWidget}
      label="API Key"
      value="sk-abc123def456"
      readOnly
    />
  ),
}

export const ColorPicker: StoryObj = {
  render: () => <FieldWrapper component={ColorPickerWidget} label="Color" value={3} />,
}
