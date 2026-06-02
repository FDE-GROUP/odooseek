import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { HR_ACTION_XML_ID, HR_EMPLOYEE_MODEL, hrEmployeeRecordPath } from '../../lib/hr'

function HrEmployees() {
  return (
    <ModuleRoute
      model={HR_EMPLOYEE_MODEL}
      actionXmlId={HR_ACTION_XML_ID.employees}
      listPath="/hr/employees"
      recordPath={hrEmployeeRecordPath}
    />
  )
}

export const Route = createFileRoute('/hr/employees')({
  component: HrEmployees,
  beforeLoad: requireAuth,
})
