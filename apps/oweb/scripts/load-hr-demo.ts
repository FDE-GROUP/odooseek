#!/usr/bin/env bun

/**
 * Load Odoo hr module demo data.
 * Requires a running Odoo 19 CE instance (configured via env vars or defaults).
 *
 * Usage:
 *   bun run apps/oweb/scripts/load-hr-demo.ts
 */

const BASE_URL = process.env.ODOO_URL || 'http://localhost:8069'
const DB = process.env.ODOO_DB || 'odoo'
const USERNAME = process.env.ODOO_USER || 'admin'
const PASSWORD = process.env.ODOO_PASSWORD || 'admin'

interface JsonRpcResponse {
  jsonrpc: string
  id?: number | null
  result?: unknown
  error?: { code: number; message: string; data: unknown }
}

async function rpc(path: string, params: unknown): Promise<unknown> {
  const url = `${BASE_URL}/jsonrpc`
  const body = { jsonrpc: '2.0', method: 'call', params, id: Date.now() }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json()) as JsonRpcResponse
  if (data.error) throw new Error(data.error.message)
  return data.result
}

async function authenticate(): Promise<number> {
  const result = (await rpc('/web/session/authenticate', {
    db: DB,
    login: USERNAME,
    password: PASSWORD,
    base_location: BASE_URL,
  })) as { uid: number }
  return result.uid
}

async function callKw(model: string, method: string, args: unknown[], kwargs = {}): Promise<unknown> {
  return rpc('/web/dataset/call_kw', {
    model,
    method,
    args,
    kwargs: { ...kwargs, context: {} },
  })
}

async function main() {
  console.log(`Connecting to ${BASE_URL} (db: ${DB})...`)
  const uid = await authenticate()
  console.log(`Authenticated as uid=${uid}`)

  try {
    // Check if hr module is installed
    const modules = (await callKw('ir.module.module', 'search_read', [
      [['name', '=', 'hr_skills'], ['state', '=', 'installed']],
      ['id'],
    ])) as Array<{ id: number }>

    if (modules.length > 0) {
      console.log('hr_skills is installed, loading demo data...')
      await callKw('hr.employee', '_load_demo_data', [])
      console.log('HR demo data loaded successfully.')
    } else {
      console.log('hr_skills not installed. Installing via module button...')
      const mods = (await callKw('ir.module.module', 'search_read', [
        [['name', 'in', ['hr', 'hr_skills', 'hr_recruitment']]],
        ['id', 'state'],
      ])) as Array<{ id: number; state: string }>
      for (const mod of mods) {
        if (mod.state !== 'installed') {
          console.log(`Installing module ${mod.id}...`)
          await callKw('ir.module.module', 'button_immediate_install', [[mod.id]])
        }
      }
      console.log('Modules installed. Loading demo data...')
      await callKw('hr.employee', '_load_demo_data', [])
      console.log('HR demo data loaded successfully.')
    }
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : String(err))
    process.exit(1)
  }
}

main()
