import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { Pagination } from '../Pagination'

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    offset: { control: 'number' },
    total: { control: 'number' },
    limit: { control: 'number' },
    onPageChange: { action: 'pageChange' },
    onLimitChange: { action: 'limitChange' },
  },
}

export default meta
type Story = StoryObj<typeof Pagination>

export const FirstPage: Story = {
  args: {
    offset: 0,
    total: 256,
    limit: 40,
    onPageChange: () => {},
    onLimitChange: () => {},
  },
}

export const MiddlePage: Story = {
  args: {
    offset: 80,
    total: 256,
    limit: 40,
    onPageChange: () => {},
    onLimitChange: () => {},
  },
}

export const LastPage: Story = {
  args: {
    offset: 240,
    total: 256,
    limit: 40,
    onPageChange: () => {},
    onLimitChange: () => {},
  },
}

export const Empty: Story = {
  args: {
    offset: 0,
    total: 0,
    limit: 40,
    onPageChange: () => {},
    onLimitChange: () => {},
  },
}

export const SinglePage: Story = {
  args: {
    offset: 0,
    total: 25,
    limit: 40,
    onPageChange: () => {},
    onLimitChange: () => {},
  },
}
