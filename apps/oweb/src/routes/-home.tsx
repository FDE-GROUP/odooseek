import { useNavigate } from '@tanstack/react-router'

const FEATURES = [
  {
    title: 'Modern Frontend',
    description:
      'Built with React 19, TypeScript, and TanStack Router. No more OWL framework lock-in.',
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Code</title>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: 'Type-Safe API',
    description:
      'Full TypeScript types for Odoo JSON-RPC calls. IDE autocomplete for models, fields, and methods.',
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Edit</title>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
  },
  {
    title: 'Decoupled Architecture',
    description:
      'SPA runs independently from Odoo server. Deploy to CDN, Nginx, or any static host.',
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Architecture</title>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
        <line x1="9" y1="2" x2="9" y2="4" />
        <line x1="15" y1="2" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="22" />
        <line x1="15" y1="20" x2="15" y2="22" />
      </svg>
    ),
  },
  {
    title: 'Extensible Modules',
    description:
      'Feature-based module organization. Add CRM, Sales, Inventory, or custom modules progressively.',
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Modules</title>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
]

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-12">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-semibold tracking-tight">
            <span className="text-accent">OdooSeek</span>
            <span className="text-text-secondary"> / oweb</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-text-secondary">
            A modern, type-safe React frontend for Odoo ERP. Decoupled. Extensible. Open source.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border-subtle bg-surface/50 p-5 transition-colors hover:border-border-default"
            >
              <div className="mb-3 text-accent">{f.icon}</div>
              <h3 className="mb-1 text-sm font-semibold text-text-primary">{f.title}</h3>
              <p className="text-xs leading-relaxed text-text-secondary">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: '/login' })}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:brightness-110"
          >
            Connect to Odoo
          </button>
          <a
            href="http://localhost:8069"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-border-default px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-hover"
          >
            Open Odoo Classic
          </a>
        </div>
      </div>
    </div>
  )
}
