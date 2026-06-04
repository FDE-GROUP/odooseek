import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/accounting/')({
  beforeLoad: () => {
    throw redirect({ to: '/accounting/dashboard' })
  },
})
