import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/expenses/')({
  beforeLoad: () => {
    throw redirect({ to: '/expenses/my' })
  },
})
