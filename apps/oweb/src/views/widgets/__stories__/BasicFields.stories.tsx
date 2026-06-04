import type { Meta, StoryObj } from '@storybook/tanstack-react'
import {
  BooleanToggleWidget,
  BooleanWidget,
  CharWidget,
  FloatWidget,
  IntegerWidget,
  TextWidget,
} from '../basic'
import type { FieldWidgetProps } from '../index'

const meta: Meta = {
  title: 'Widgets/Basic Fields',
  tags: ['autodocs'],
}

export default meta

const makeField = (name: string, type: string) =>
  ({ attributes: { name, type } }) as unknown as Parameters<typeof CharWidget>[0]['field']

function FieldWrapper({
  component: Comp,
  label,
  value,
  readOnly,
}: {
  component: React.ComponentType<FieldWidgetProps>
  label: string
  value: unknown
  readOnly?: boolean
}) {
  return (
    <div className="w-full max-w-md space-y-1">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <Comp
        field={makeField(label, 'char')}
        value={value}
        onChange={() => {}}
        readOnly={readOnly}
      />
    </div>
  )
}

export const CharEdit: StoryObj = {
  render: () => <FieldWrapper component={CharWidget} label="Name" value="John Doe" />,
}

export const CharReadOnly: StoryObj = {
  render: () => <FieldWrapper component={CharWidget} label="Name" value="John Doe" readOnly />,
}

export const CharEmpty: StoryObj = {
  render: () => <FieldWrapper component={CharWidget} label="Name" value="" />,
}

export const TextEdit: StoryObj = {
  render: () => (
    <FieldWrapper
      component={TextWidget}
      label="Notes"
      value="This is a long text field.\nMultiple lines supported."
    />
  ),
}

export const IntegerEdit: StoryObj = {
  render: () => <FieldWrapper component={IntegerWidget} label="Quantity" value={42} />,
}

export const FloatEdit: StoryObj = {
  render: () => <FieldWrapper component={FloatWidget} label="Price" value={19.99} />,
}

export const BooleanEdit: StoryObj = {
  render: () => <FieldWrapper component={BooleanWidget} label="Active" value={true} />,
}

export const BooleanUnchecked: StoryObj = {
  render: () => <FieldWrapper component={BooleanWidget} label="Active" value={false} />,
}

export const BooleanToggleOn: StoryObj = {
  render: () => <FieldWrapper component={BooleanToggleWidget} label="Enabled" value={true} />,
}

export const BooleanToggleOff: StoryObj = {
  render: () => <FieldWrapper component={BooleanToggleWidget} label="Enabled" value={false} />,
}
