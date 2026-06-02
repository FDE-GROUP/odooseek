import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/purchase/')({
  beforeLoad: () => {
    throw redirect({ to: '/purchase/rfqs' })
  },
})
