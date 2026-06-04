import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function TaskStages() {
  return (
    <ModuleRoute
      model="project.task.type"
      actionXmlId="project.open_task_type_form"
      listPath="/project/task-stages"
    />
  )
}

export const Route = createFileRoute('/project/task-stages')({
  component: TaskStages,
  beforeLoad: requireAuth,
})
