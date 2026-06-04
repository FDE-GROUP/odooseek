import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/recruitment/')({
  beforeLoad: () => {
    throw redirect({ to: '/recruitment/applicants' })
  },
})
