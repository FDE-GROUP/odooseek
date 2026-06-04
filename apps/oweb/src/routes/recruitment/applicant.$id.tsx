import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function RecruitmentApplicantForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="hr.applicant" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/recruitment/applicant/$id')({
  component: RecruitmentApplicantForm,
  beforeLoad: requireAuth,
})
