/** Safe client-side QWeb expression evaluator for kanban templates */

function resolveValue(expr: string, record: Record<string, unknown>): unknown {
  const m = expr.match(/^(?:record|parent)\.(\w+)(?:\[(\d+)\])?$/)
  if (m) {
    const val = record[m[1]]
    if (m[2] !== undefined && Array.isArray(val)) return val[Number(m[2])]
    return val
  }
  // Handle string literal comparisons: parent.field == 'value'
  const cmp = expr.match(/^(?:record|parent)\.(\w+)\s*(==|!=)\s*'([^']*)'$/)
  if (cmp) {
    const val = record[cmp[1]]
    if (cmp[2] === '==') return val === cmp[3]
    return val !== cmp[3]
  }
  // Handle numeric comparisons
  const numCmp = expr.match(/^(?:record|parent)\.(\w+)\s*(==|!=|>|<|>=|<=)\s*(\d+)$/)
  if (numCmp) {
    const val = Number(record[numCmp[1]]) || 0
    const num = Number(numCmp[3])
    const op = numCmp[2]
    if (op === '==') return val === num
    if (op === '!=') return val !== num
    if (op === '>') return val > num
    if (op === '<') return val < num
    if (op === '>=') return val >= num
    if (op === '<=') return val <= num
  }
  return undefined
}

/** Evaluate a QWeb condition expression against a record */
export function evalCondition(expr: string, record: Record<string, unknown>): boolean {
  // Odoo kanban: record.image_1024.raw_value
  const rawMatch = expr.match(/^record\.(\w+)\.raw_value$/)
  if (rawMatch) {
    const val = record[rawMatch[1]]
    return val != null && val !== false && val !== ''
  }

  // Handle: "!record.field"
  const notMatch = expr.match(/^!\s*record\.(\w+)$/)
  if (notMatch) {
    return !record[notMatch[1]]
  }

  // Handle: "expr1 && expr2"
  const andParts = splitExpr(expr, '&&')
  if (andParts.length > 1) return andParts.every((p) => evalCondition(p.trim(), record))

  // Handle: "expr1 || expr2"
  const orParts = splitExpr(expr, '||')
  if (orParts.length > 1) return orParts.some((p) => evalCondition(p.trim(), record))

  // Handle: simple "record.field" or "record.field[0]"
  const val = resolveValue(expr, record)
  return !!val
}

function splitExpr(expr: string, sep: string): string[] {
  const result: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < expr.length - sep.length + 1; i++) {
    if (expr[i] === '(') depth++
    if (expr[i] === ')') depth--
    if (depth === 0 && expr.slice(i, i + sep.length) === sep) {
      result.push(expr.slice(start, i).trim())
      start = i + sep.length
      i += sep.length - 1
    }
  }
  result.push(expr.slice(start).trim())
  return result
}

/** Get a value from an expression against a record */
export function getValue(expr: string, record: Record<string, unknown>): unknown {
  return resolveValue(expr, record)
}

// ── Modifier / Decoration expression evaluator ─────────────────

export const DECORATION_MAP: Record<string, string> = {
  bf: 'font-bold',
  it: 'italic',
  danger: 'text-red-400',
  warning: 'text-yellow-400',
  success: 'text-green-400',
  info: 'text-blue-400',
  muted: 'text-text-muted',
}

export function evalModifier(
  expr: string | undefined | null,
  record: Record<string, unknown> | undefined,
): boolean {
  if (!expr || !record) return false
  if (expr === 'False' || expr === '0') return false
  if (expr === 'True' || expr === '1') return true

  // Check if this is a domain-style expression: [...]  or & [...] [...] or | [...] [...]
  const trimmed = expr.trim()
  if (trimmed.startsWith('[') || trimmed.startsWith('&') || trimmed.startsWith('|')) {
    try {
      return evaluateModifierDomain(trimmed, record)
    } catch {
      return false
    }
  }

  try {
    return evaluateModifierExpr(expr, record)
  } catch {
    return false
  }
}

function evaluateModifierDomain(expr: string, record: Record<string, unknown>): boolean {
  // Normalize: replace ( ) → [ ], and standardize quoting
  const normalized = expr
    .replace(/'/g, '"')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bNone\b/g, 'null')
    .replace(/\(/g, '[')
    .replace(/\)/g, ']')

  let parsed: unknown[]
  try {
    parsed = JSON.parse(normalized) as unknown[]
  } catch {
    return false
  }

  // If it starts with & or |, it's a combined expression
  if (expr.startsWith('&')) {
    return evaluateDomainAnd(parsed as unknown[], record)
  }
  if (expr.startsWith('|')) {
    return evaluateDomainOr(parsed as unknown[], record)
  }

  // Single domain list: [[field, op, value], ...]
  return evaluateDomainList(normalized ? (JSON.parse(normalized) as unknown[]) : [], record)
}

function evaluateDomainAnd(items: unknown[], record: Record<string, unknown>): boolean {
  // Domain operators: '&' prefix means all following conditions must be true
  // Items structure: ['&', [condition1], [condition2]]   or   [['&'], [c1], [c2]]
  const conditions = items.filter((item) => Array.isArray(item) && item.length > 0)
  return conditions.every((cond) => evaluateDomainList(cond as unknown[], record))
}

function evaluateDomainOr(items: unknown[], record: Record<string, unknown>): boolean {
  const conditions = items.filter((item) => Array.isArray(item) && item.length > 0)
  return conditions.some((cond) => evaluateDomainList(cond as unknown[], record))
}

function evaluateDomainList(domain: unknown[], record: Record<string, unknown>): boolean {
  // Each element is a triple [field, operator, value]
  for (const item of domain) {
    if (!Array.isArray(item) || item.length < 3) continue
    const [field, op, expected] = item as [string, string, unknown]
    const actual = record[field]
    const actualStr = String(actual ?? '')
    const expectedStr = String(expected ?? '')

    let result = false
    switch (op) {
      case '=':
        result = actual === expected || actualStr === expectedStr
        break
      case '!=':
        result = actual !== expected && actualStr !== expectedStr
        break
      case '>':
        result = Number(actual) > Number(expected)
        break
      case '<':
        result = Number(actual) < Number(expected)
        break
      case '>=':
        result = Number(actual) >= Number(expected)
        break
      case '<=':
        result = Number(actual) <= Number(expected)
        break
      case 'in':
        if (Array.isArray(expected)) {
          result = expected.includes(actual) || expected.some((e: unknown) => String(e) === actualStr)
        }
        break
      case 'not in':
        if (Array.isArray(expected)) {
          result = !expected.includes(actual) && !expected.some((e: unknown) => String(e) === actualStr)
        }
        break
      case 'ilike':
        result = actualStr.toLowerCase().includes(expectedStr.toLowerCase())
        break
      case 'not ilike':
        result = !actualStr.toLowerCase().includes(expectedStr.toLowerCase())
        break
      case 'child_of':
        // Simplified child_of: check if actual is hierarchical (parent_id chain)
        result = actual === expected || actualStr === expectedStr
        break
      default:
        result = actual === expected || actualStr === expectedStr
    }
    if (!result) return false
  }
  return true
}

function evaluateModifierExpr(expr: string, record: Record<string, unknown>): boolean {
  const inMatch = expr.match(/^(\w+)\s+in\s+\[(.+)\]$/)
  if (inMatch) {
    const val = record[inMatch[1]]
    const items = inMatch[2].split(',').map((s) => s.trim().replace(/'/g, ''))
    return items.includes(String(val))
  }
  const notInMatch = expr.match(/^(\w+)\s+not\s+in\s+\[(.+)\]$/)
  if (notInMatch) {
    const val = record[notInMatch[1]]
    const items = notInMatch[2].split(',').map((s) => s.trim().replace(/'/g, ''))
    return !items.includes(String(val))
  }
  const eqMatch = expr.match(/^(\w+)\s*==\s*'(.+)'$/)
  if (eqMatch) return String(record[eqMatch[1]]) === eqMatch[2]
  const neqMatch = expr.match(/^(\w+)\s*!=\s*'(.+)'$/)
  if (neqMatch) return String(record[neqMatch[1]]) !== neqMatch[2]
  return !!record[expr]
}

/** Evaluate all decoration expressions for a field/row and return CSS class string */
export function getDecorationClass(
  el: Record<string, unknown>,
  record: Record<string, unknown> | undefined,
): string | undefined {
  if (!record) return undefined
  const classes: string[] = []
  for (const [key, cls] of Object.entries(DECORATION_MAP)) {
    const expr = el[`decoration_${key}`] ?? el[`decoration-${key}`]
    if (expr && evalModifier(String(expr), record)) classes.push(cls)
  }
  return classes.length ? classes.join(' ') : undefined
}

// ── Domain string parser ────────────────────────────────────

export function parseDomainString(raw: string | null): unknown[] | null {
  if (!raw) return []
  const s = raw.trim()
  if (!s) return []

  const decoded = s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')

  const normalized = decoded
    .replace(/'/g, '"')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bNone\b/g, 'null')
    .replace(/\(/g, '[')
    .replace(/\)/g, ']')

  try {
    return JSON.parse(normalized)
  } catch {
    return null
  }
}
