import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/mrp/')({
  beforeLoad: () => {
    throw redirect({ to: '/mrp/productions' })
  },
})
