import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/attendance/')({
  beforeLoad: () => {
    throw redirect({ to: '/attendance/kiosk' })
  },
})
