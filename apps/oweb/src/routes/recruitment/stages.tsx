import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function RecruitmentStages() {
  return (
    <ModuleRoute
      model="hr.recruitment.stage"
      actionXmlId="hr_recruitment.action_hr_recruitment_stage"
      listPath="/recruitment/stages"
    />
  )
}

export const Route = createFileRoute('/recruitment/stages')({
  component: RecruitmentStages,
  beforeLoad: requireAuth,
})
