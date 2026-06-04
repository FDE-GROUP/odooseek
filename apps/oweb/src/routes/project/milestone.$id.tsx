import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function ProjectMilestoneForm() {
  const { id } = Route.useParams()
  return <ModuleRoute model="project.milestone" fallbackView="form" recordId={Number(id)} />
}

export const Route = createFileRoute('/project/milestone/$id')({
  component: ProjectMilestoneForm,
  beforeLoad: requireAuth,
})
