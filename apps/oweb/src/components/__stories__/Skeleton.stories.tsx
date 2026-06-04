import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { ListSkeleton, FormSheetSkeleton, FormSkeleton } from '../Skeleton'

const meta: Meta = {
  title: 'Components/Skeleton',
  tags: ['autodocs'],
}

export default meta

export const ListView: StoryObj = {
  render: () => (
    <div className="h-96 w-full">
      <ListSkeleton />
    </div>
  ),
}

export const FormSheet: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl">
      <FormSheetSkeleton />
    </div>
  ),
}

export const FullForm: StoryObj = {
  render: () => (
    <div className="h-[600px] w-full">
      <FormSkeleton />
    </div>
  ),
}
