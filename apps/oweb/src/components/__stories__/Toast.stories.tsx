import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { ToastContainer } from '../Toast'
import { ToastProvider, useToast } from '@/hooks/useToast'
import { useEffect } from 'react'

function ToastDemo({
  type,
  message,
}: {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}) {
  const toast = useToast()
  useEffect(() => {
    toast[type](message)
  }, [type, message, toast])
  return <ToastContainer />
}

const meta: Meta<typeof ToastContainer> = {
  title: 'Components/Toast',
  component: ToastContainer,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ToastContainer>

export const Success: Story = {
  render: () => <ToastDemo type="success" message="Record saved successfully" />,
}

export const Error: Story = {
  render: () => <ToastDemo type="error" message="Failed to save record" />,
}

export const Warning: Story = {
  render: () => <ToastDemo type="warning" message="You have unsaved changes" />,
}

export const Info: Story = {
  render: () => <ToastDemo type="info" message="Loading data from server..." />,
}
