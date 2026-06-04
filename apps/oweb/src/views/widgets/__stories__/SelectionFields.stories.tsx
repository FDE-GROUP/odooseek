import type { Meta, StoryObj } from '@storybook/tanstack-react'
import type { FieldWidgetProps } from '../index'
import { PriorityWidget, SelectionWidget, StateBadgeWidget, StatusbarWidget } from '../selection'

const meta: Meta = {
  title: 'Widgets/Selection Fields',
  tags: ['autodocs'],
}

export default meta

const STATUS_SELECTION: [string, string][] = [
  ['draft', 'Draft'],
  ['confirmed', 'Confirmed'],
  ['done', 'Done'],
  ['cancel', 'Cancelled'],
]

const PRIORITY_SELECTION: [string, string][] = [
  ['0', 'Low'],
  ['1', 'Medium'],
  ['2', 'High'],
  ['3', 'Very High'],
]

function SelectionWrapper({
  component: Comp,
  label,
  value,
  selection,
  readOnly,
}: {
  component: React.ComponentType<FieldWidgetProps>
  label: string
  value: unknown
  selection: [string, string][]
  readOnly?: boolean
}) {
  return (
    <div className="w-full max-w-md space-y-1">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <Comp
        field={
          { attributes: { name: label, type: 'selection' } } as unknown as Parameters<
            typeof SelectionWidget
          >[0]['field']
        }
        value={value}
        onChange={() => {}}
        readOnly={readOnly}
        meta={{ selection }}
      />
    </div>
  )
}

export const SelectionEdit: StoryObj = {
  render: () => (
    <SelectionWrapper
      component={SelectionWidget}
      label="Status"
      value="draft"
      selection={STATUS_SELECTION}
    />
  ),
}

export const SelectionReadOnly: StoryObj = {
  render: () => (
    <SelectionWrapper
      component={SelectionWidget}
      label="Status"
      value="confirmed"
      selection={STATUS_SELECTION}
      readOnly
    />
  ),
}

export const PriorityWidgetStory: StoryObj = {
  name: 'Priority Widget',
  render: () => (
    <SelectionWrapper
      component={PriorityWidget}
      label="Priority"
      value="1"
      selection={PRIORITY_SELECTION}
    />
  ),
}

export const PriorityHigh: StoryObj = {
  name: 'Priority High',
  render: () => (
    <SelectionWrapper
      component={PriorityWidget}
      label="Priority"
      value="3"
      selection={PRIORITY_SELECTION}
    />
  ),
}

export const Statusbar: StoryObj = {
  render: () => (
    <SelectionWrapper
      component={StatusbarWidget}
      label="State"
      value="confirmed"
      selection={STATUS_SELECTION}
    />
  ),
}

export const StatusbarDraft: StoryObj = {
  name: 'Statusbar Draft',
  render: () => (
    <SelectionWrapper
      component={StatusbarWidget}
      label="State"
      value="draft"
      selection={STATUS_SELECTION}
    />
  ),
}

export const StateBadge: StoryObj = {
  render: () => (
    <SelectionWrapper
      component={StateBadgeWidget}
      label="State"
      value="confirmed"
      selection={STATUS_SELECTION}
      readOnly
    />
  ),
}
