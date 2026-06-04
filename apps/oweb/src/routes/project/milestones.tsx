import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function ProjectMilestones() {
  return (
    <ModuleRoute
      model="project.milestone"
      actionXmlId="project.action_view_project_milestone"
      listPath="/project/milestones"
      recordPath={(id) => `/project/milestone/${id}`}
    />
  )
}

export const Route = createFileRoute('/project/milestones')({
  component: ProjectMilestones,
  beforeLoad: requireAuth,
})
