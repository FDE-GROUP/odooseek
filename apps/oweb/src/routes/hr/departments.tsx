import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { HR_ACTION_XML_ID, HR_DEPARTMENT_MODEL, hrDepartmentRecordPath } from '../../lib/hr'

function HrDepartments() {
  return (
    <ModuleRoute
      model={HR_DEPARTMENT_MODEL}
      actionXmlId={HR_ACTION_XML_ID.departments}
      listPath="/hr/departments"
      recordPath={hrDepartmentRecordPath}
    />
  )
}

export const Route = createFileRoute('/hr/departments')({
  component: HrDepartments,
  beforeLoad: requireAuth,
})
