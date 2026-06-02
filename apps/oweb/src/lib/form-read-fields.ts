import type { FormElement, OdooFieldMeta } from '@odooseek/odoo-client'
import { callKw } from '@odooseek/odoo-client'
import type { GroupCheckSession } from './auth'
import { passesXmlGroups } from './field-access'

const READ_BASE_FIELDS = ['id', 'display_name', 'active', 'write_date', 'create_date'] as const

function isStaticInvisible(invisible?: string | boolean): boolean {
  return invisible === true || invisible === '1'
}

function walkFormElements(
  elements: FormElement[],
  session: GroupCheckSession | undefined,
  names: Set<string>,
): void {
  for (const el of elements) {
    switch (el.type) {
      case 'field': {
        if (!el.name) break
        if (!passesXmlGroups(el.groups, session)) break
        if (isStaticInvisible(el.invisible)) break
        names.add(el.name)
        if (el.subViews?.form?.elements) {
          walkFormElements(el.subViews.form.elements, session, names)
        }
        break
      }
      case 'group':
        if (!passesXmlGroups(el.groups, session)) break
        walkFormElements(el.elements, session, names)
        break
      case 'sheet':
      case 'title_block':
        walkFormElements(el.elements, session, names)
        break
      case 'layout_row':
        for (const col of el.columns) walkFormElements(col.elements, session, names)
        break
      case 'notebook':
        for (const page of el.pages) {
          if (isStaticInvisible(page.invisible)) continue
          walkFormElements(page.elements, session, names)
        }
        break
      case 'button_box':
        for (const btn of el.buttons) {
          if (btn.content?.type === 'field' && btn.content.fieldName) {
            names.add(btn.content.fieldName)
          }
        }
        break
      case 'header':
        break
      default:
        break
    }
  }
}

/** Field names to pass to `read` / `default_get` — arch only, not full `fields_get`. */
export function resolveFormReadFields(
  elements: FormElement[],
  fieldsMeta: Record<string, OdooFieldMeta>,
  session?: GroupCheckSession,
): string[] {
  const names = new Set<string>()
  for (const key of READ_BASE_FIELDS) {
    if (key in fieldsMeta) names.add(key)
  }
  walkFormElements(elements, session, names)
  return [...names].filter((name) => name in fieldsMeta)
}

/** Extract field name from Odoo AccessError message (en / zh). */
export function parseInaccessibleFieldFromError(message: string): string | undefined {
  const patterns = [
    /字段[「『"'“”‘’]([^」』"'“”‘’]+)[」』"'“”‘’]/,
    /field[s]?\s+['"]([^'"]+)['"]/i,
    /access\s+[^.]+\s+field[s]?\s+['"]([^'"]+)['"]/i,
  ]
  for (const re of patterns) {
    const m = message.match(re)
    if (m?.[1]) return m[1]
  }
  return undefined
}

export async function readRecordWithFieldFallback(
  model: string,
  recordId: number,
  fieldNames: string[],
): Promise<Array<Record<string, unknown>>> {
  let names = [...new Set(fieldNames)]
  for (let attempt = 0; attempt < 8 && names.length > 0; attempt++) {
    try {
      return await callKw<Array<Record<string, unknown>>>(model, 'read', [[recordId], names])
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const denied = parseInaccessibleFieldFromError(msg)
      if (!denied || !names.includes(denied)) throw err
      names = names.filter((n) => n !== denied)
    }
  }
  throw new Error(`Unable to read ${model} record ${recordId}: no accessible fields`)
}
