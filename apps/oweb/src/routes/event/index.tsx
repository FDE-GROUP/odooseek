import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/event/')({
  beforeLoad: () => {
    throw redirect({ to: '/event/events' })
  },
})
