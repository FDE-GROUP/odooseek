import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/project/')({
  beforeLoad: () => {
    throw redirect({ to: '/project/tasks' })
  },
})
