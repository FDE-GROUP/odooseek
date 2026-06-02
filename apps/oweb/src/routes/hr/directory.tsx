import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { HR_ACTION_XML_ID, HR_EMPLOYEE_PUBLIC_MODEL, hrEmployeeRecordPath } from '../../lib/hr'

function HrDirectory() {
  return (
    <ModuleRoute
      model={HR_EMPLOYEE_PUBLIC_MODEL}
      actionXmlId={HR_ACTION_XML_ID.directory}
      domain={[['active', '=', true]]}
      listPath="/hr/directory"
      recordPath={hrEmployeeRecordPath}
    />
  )
}

export const Route = createFileRoute('/hr/directory')({
  component: HrDirectory,
  beforeLoad: requireAuth,
})
