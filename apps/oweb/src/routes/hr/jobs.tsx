import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { HR_JOB_MODEL } from '../../lib/hr'

function HrJobs() {
  return <ModuleRoute model={HR_JOB_MODEL} defaultView="list" listPath="/hr/jobs" />
}

export const Route = createFileRoute('/hr/jobs')({
  component: HrJobs,
  beforeLoad: requireAuth,
})
