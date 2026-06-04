import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function RecruitmentApplicants() {
  return (
    <ModuleRoute
      model="hr.applicant"
      actionXmlId="hr_recruitment.action_hr_job_applications"
      listPath="/recruitment/applicants"
      recordPath={(id) => `/recruitment/applicant/${id}`}
    />
  )
}

export const Route = createFileRoute('/recruitment/applicants')({
  component: RecruitmentApplicants,
  beforeLoad: requireAuth,
})
