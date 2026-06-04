import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { requireAuth } from '../lib/auth'

const ODOO_DISCUSS_URL = import.meta.env.VITE_ODOO_URL
  ? `${import.meta.env.VITE_ODOO_URL}/web#action=124`
  : null

function Discuss() {
  useEffect(() => {
    const url =
      ODOO_DISCUSS_URL ||
      `${window.location.origin.replace(':5173', ':8069').replace(':3000', ':8069')}/web#action=124`
    window.open(url, '_blank')
  }, [])

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center text-muted-foreground">
      <div className="text-center">
        <div className="mb-4 text-5xl">💬</div>
        <h2 className="text-lg font-semibold">Discuss</h2>
        <p className="mt-2 text-sm">Opened in a new tab.</p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/discuss')({
  component: Discuss,
  beforeLoad: requireAuth,
})
