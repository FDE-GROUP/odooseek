import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/hr/')({
  beforeLoad: () => {
    throw redirect({ to: '/hr/employees' })
  },
})
