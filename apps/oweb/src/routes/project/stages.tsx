import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function ProjectStages() {
  return (
    <ModuleRoute
      model="project.project.stage"
      actionXmlId="project.project_project_stage_action"
      listPath="/project/stages"
    />
  )
}

export const Route = createFileRoute('/project/stages')({
  component: ProjectStages,
  beforeLoad: requireAuth,
})
