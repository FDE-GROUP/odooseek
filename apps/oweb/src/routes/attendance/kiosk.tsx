import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { ATTENDANCE_ACTION_XML_ID, ATTENDANCE_MODEL } from '../../lib/attendance'
import { requireAuth } from '../../lib/auth'

function AttendanceKiosk() {
  return (
    <ModuleRoute
      model={ATTENDANCE_MODEL}
      actionXmlId={ATTENDANCE_ACTION_XML_ID.kiosk}
      listPath="/attendance/kiosk"
    />
  )
}

export const Route = createFileRoute('/attendance/kiosk')({
  component: AttendanceKiosk,
  beforeLoad: requireAuth,
})
