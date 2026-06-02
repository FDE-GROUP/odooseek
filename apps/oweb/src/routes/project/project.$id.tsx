import { createFileRoute, redirect } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { PROJECT_PROJECT_MODEL, projectProjectRecordPath } from '../../lib/project'

function ProjectProjectForm() {
  const { id } = Route.useParams()
  const recordId = Number(id)
  if (!Number.isFinite(recordId) || recordId <= 0) {
    return <div className="p-6 text-sm text-text-muted">Invalid project id</div>
  }
  return (
    <ModuleRoute
      model={PROJECT_PROJECT_MODEL}
      fallbackView="form"
      recordId={recordId}
      listPath="/project/projects"
      recordPath={projectProjectRecordPath}
    />
  )
}

export const Route = createFileRoute('/project/project/$id')({
  component: ProjectProjectForm,
  beforeLoad: requireAuth,
  parseParams: ({ id }) => {
    const n = Number(id)
    if (!Number.isFinite(n) || n <= 0) throw redirect({ to: '/project/projects' })
    return { id: String(n) }
  },
})
