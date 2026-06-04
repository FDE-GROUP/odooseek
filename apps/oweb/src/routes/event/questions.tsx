import { createFileRoute } from '@tanstack/react-router'
import { ModuleRoute } from '../../components/ModuleRoute'
import { requireAuth } from '../../lib/auth'

function EventQuestions() {
  return <ModuleRoute model="event.question" listPath="/event/questions" />
}

export const Route = createFileRoute('/event/questions')({
  component: EventQuestions,
  beforeLoad: requireAuth,
})
