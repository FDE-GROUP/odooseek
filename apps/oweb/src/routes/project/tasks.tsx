import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { PROJECT_ACTION_XML_ID, PROJECT_TASK_MODEL, projectTaskRecordPath } from '../../lib/project'

function ProjectTasks() {
  return (
    <ModuleRoute
      model={PROJECT_TASK_MODEL}
      actionXmlId={PROJECT_ACTION_XML_ID.tasks}
      listPath="/project/tasks"
      recordPath={projectTaskRecordPath}
    />
  )
}

export const Route = createFileRoute('/project/tasks')({
  component: ProjectTasks,
  beforeLoad: requireAuth,
})
