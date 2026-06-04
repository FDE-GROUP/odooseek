import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { ErrorBanner } from '../ErrorBanner'

const meta: Meta<typeof ErrorBanner> = {
  title: 'Components/ErrorBanner',
  component: ErrorBanner,
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof ErrorBanner>

export const Default: Story = {
  args: {
    message: 'Something went wrong. Please try again.',
  },
}

export const LongMessage: Story = {
  args: {
    message:
      'Unable to connect to Odoo server. The server may be down or unreachable. Please check your network connection and try again.',
  },
}

export const ShortMessage: Story = {
  args: {
    message: 'Invalid credentials',
  },
}
