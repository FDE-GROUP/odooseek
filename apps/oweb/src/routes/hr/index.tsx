import { createFileRoute, redirect } from '@tanstack/react-router'
import { HR_EMPLOYEES_SEARCH_DEFAULT } from '../../lib/hr'

export const Route = createFileRoute('/hr/')({
  beforeLoad: () => {
    throw redirect({ to: '/hr/employees', search: HR_EMPLOYEES_SEARCH_DEFAULT })
  },
})
