import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import {
  PROJECT_ACTION_XML_ID,
  PROJECT_PROJECT_MODEL,
  projectProjectRecordPath,
} from '../../lib/project'

function ProjectProjects() {
  return (
    <ModuleRoute
      model={PROJECT_PROJECT_MODEL}
      actionXmlId={PROJECT_ACTION_XML_ID.projects}
      listPath="/project/projects"
      recordPath={projectProjectRecordPath}
    />
  )
}

export const Route = createFileRoute('/project/projects')({
  component: ProjectProjects,
  beforeLoad: requireAuth,
})
