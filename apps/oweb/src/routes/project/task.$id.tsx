import { createFileRoute, redirect } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { PROJECT_TASK_MODEL, projectTaskRecordPath } from '../../lib/project'

function ProjectTaskForm() {
  const { id } = Route.useParams()
  const recordId = Number(id)
  if (!Number.isFinite(recordId) || recordId <= 0) {
    return <div className="p-6 text-sm text-text-muted">Invalid task id</div>
  }
  return (
    <ModuleRoute
      model={PROJECT_TASK_MODEL}
      fallbackView="form"
      recordId={recordId}
      listPath="/project/tasks"
      recordPath={projectTaskRecordPath}
    />
  )
}

export const Route = createFileRoute('/project/task/$id')({
  component: ProjectTaskForm,
  beforeLoad: requireAuth,
  parseParams: ({ id }) => {
    const n = Number(id)
    if (!Number.isFinite(n) || n <= 0) throw redirect({ to: '/project/tasks' })
    return { id: String(n) }
  },
})
