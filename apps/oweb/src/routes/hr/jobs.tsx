import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { HR_ACTION_XML_ID, HR_JOB_MODEL } from '../../lib/hr'

function HrJobs() {
  return (
    <ModuleRoute model={HR_JOB_MODEL} actionXmlId={HR_ACTION_XML_ID.jobs} listPath="/hr/jobs" />
  )
}

export const Route = createFileRoute('/hr/jobs')({
  component: HrJobs,
  beforeLoad: requireAuth,
})
