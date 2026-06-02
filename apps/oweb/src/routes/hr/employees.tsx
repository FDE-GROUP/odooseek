import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'
import { HR_ACTION_XML_ID, HR_EMPLOYEE_MODEL, hrEmployeeRecordPath } from '../../lib/hr'
import { parseEmployeeIdsSearch, teamDomainFromEmployeeIds } from '../../lib/hr-org-chart'

function HrEmployees() {
  const { ids } = Route.useSearch()
  const employeeIds = parseEmployeeIdsSearch(ids)
  const domain = employeeIds ? teamDomainFromEmployeeIds(employeeIds) : undefined

  return (
    <ModuleRoute
      model={HR_EMPLOYEE_MODEL}
      actionXmlId={HR_ACTION_XML_ID.employees}
      listPath="/hr/employees"
      recordPath={hrEmployeeRecordPath}
      domain={domain}
    />
  )
}

export const Route = createFileRoute('/hr/employees')({
  component: HrEmployees,
  beforeLoad: requireAuth,
  validateSearch: (search: Record<string, unknown>) => ({
    ids: typeof search.ids === 'string' ? search.ids : undefined,
  }),
})
