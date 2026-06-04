import type {
  ButtonBoxElement,
  ButtonElement,
  FieldElement,
  FormElement,
  GroupElement,
  LayoutColumnElement,
  OdooAction,
  OdooFieldMeta,
} from '@odooseek/odoo-client'
import { evalModifier, getDecorationClass as getDecoClass } from '@odooseek/odoo-client'
import { useMemo, useState } from 'react'
import type { GroupCheckSession } from '../../lib/auth'
import { passesXmlGroups } from '../../lib/field-access'
import { getFieldWidget } from '../widgets'
import { ButtonBoxRenderer } from './FormButtonBox'
import { isButtonVisible } from './FormHeaderBar'
import { HelpPopover } from './HelpPopover'

// ── Node Props ────────────────────────────────────────────────────

export interface NodeProps {
  elements: FormElement[]
  record?: Record<string, unknown>
  fields: Record<string, OdooFieldMeta>
  model: string
  recordId?: number
  editMode?: boolean
  onChange?: (name: string, value: unknown) => void
  onAction?: (action: OdooAction) => void
  onButtonAction?: (btn: ButtonElement) => void
  level?: number
  groupCol?: number
  fieldGridSpan?: number
  session?: GroupCheckSession
  missingFields?: Set<string>
  fieldErrors?: Map<string, string>
}

// ── Sheet partition helpers ──────────────────────────────────────

const TITLE_FIELD_NAMES = new Set(['name', 'display_name'])

function isTitleField(el: FormElement): el is FieldElement {
  if (el.type !== 'field') return false
  if (!TITLE_FIELD_NAMES.has(el.name)) return false
  const cls = el.class ?? ''
  return !!(el.nolabel || cls.includes('oe_inline') || cls.includes('text-break'))
}

function isAvatarField(el: FormElement): el is FieldElement {
  if (el.type !== 'field') return false
  const cls = el.class ?? ''
  if (cls.includes('oe_avatar')) return true
  return (
    (el.widget === 'image' || el.widget === 'contact_image') && /^(image_|avatar)/.test(el.name)
  )
}

function isGroupColumnsLayout(elements: FormElement[]): boolean {
  const items = elements.filter((e) => e.type !== 'newline')
  if (items.length < 2) return false
  return items.every((e) => e.type === 'group')
}

const LAYOUT_COL_SPAN: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
}

function layoutColSpanClass(span?: number): string {
  return LAYOUT_COL_SPAN[span ?? 12] ?? 'lg:col-span-12'
}

function partitionSheetElements(elements: FormElement[]) {
  const buttonBoxes: ButtonBoxElement[] = []
  const titleElements: FormElement[] = []
  const avatarElements: FormElement[] = []
  const body: FormElement[] = []
  let titlePhase = true

  for (const el of elements) {
    if (el.type === 'button_box') {
      buttonBoxes.push(el)
      continue
    }
    if (el.type === 'title_block') {
      for (const child of el.elements) {
        if (isAvatarField(child)) avatarElements.push(child)
        else titleElements.push(child)
      }
      continue
    }
    if (titlePhase && isAvatarField(el)) {
      avatarElements.push(el)
      continue
    }
    if (titlePhase && isTitleField(el)) {
      titleElements.push(el)
      continue
    }
    if (titlePhase && el.type === 'group') {
      const inner = el.elements.filter((c) => c.type !== 'newline')
      if (inner.length === 1 && isTitleField(inner[0])) {
        titleElements.push(inner[0])
        continue
      }
      const avatars = inner.filter(isAvatarField)
      const titles = inner.filter(isTitleField)
      const rest = inner.filter((c) => !isAvatarField(c) && !isTitleField(c))
      if (avatars.length > 0 || titles.length > 0) {
        avatarElements.push(...avatars)
        titleElements.push(...titles)
        if (rest.length === 0) continue
        body.push({ ...el, elements: rest })
        continue
      }
    }
    titlePhase = false
    body.push(el)
  }
  return { buttonBoxes, titleElements, avatarElements, body }
}

// ── Group rendering ───────────────────────────────────────────────

function renderGroupItems(
  elements: FormElement[],
  ctx: Omit<NodeProps, 'elements'> & { groupCol?: number },
): React.ReactNode[] {
  const result: React.ReactNode[] = []
  let colIndex = 0
  const maxCols = Math.max(1, Math.min(ctx.groupCol ?? 2, 6))

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i]
    if (el.type === 'newline') {
      colIndex = 0
      result.push(<div key={`nl-${i}`} style={{ gridColumn: '1 / -1' }} aria-hidden />)
      continue
    }

    const colspan = el.type === 'field' ? (el.colspan ?? 1) : 1
    if (colIndex + colspan > maxCols) {
      colIndex = 0
      result.push(<div key={`wrap-${i}`} style={{ gridColumn: '1 / -1' }} aria-hidden />)
    }

    const itemKey = `${el.type === 'field' ? 'fld' : el.type}-${i}`
    if (el.type !== 'field') {
      result.push(
        <div key={itemKey} style={{ gridColumn: '1 / -1' }}>
          <FormLayoutNode
            elements={[el]}
            record={ctx.record}
            fields={ctx.fields}
            model={ctx.model}
            recordId={ctx.recordId}
            editMode={ctx.editMode}
            onChange={ctx.onChange}
            onAction={ctx.onAction}
            onButtonAction={ctx.onButtonAction}
            level={ctx.level}
            groupCol={ctx.groupCol}
            session={ctx.session}
          />
        </div>,
      )
      continue
    }
    result.push(
      <div key={itemKey} className="o_group_item" style={{ display: 'contents' }}>
        <FormLayoutNode
          elements={[el]}
          record={ctx.record}
          fields={ctx.fields}
          model={ctx.model}
          recordId={ctx.recordId}
          editMode={ctx.editMode}
          onChange={ctx.onChange}
          onAction={ctx.onAction}
          onButtonAction={ctx.onButtonAction}
          level={ctx.level}
          groupCol={ctx.groupCol}
          fieldGridSpan={colspan > 1 ? colspan : undefined}
          session={ctx.session}
        />
      </div>,
    )
    colIndex += colspan
    if (colIndex >= maxCols) colIndex = 0
  }
  return result
}

// ── Notebook Renderer ─────────────────────────────────────────────

function NotebookRenderer({
  pages,
  record,
  fields,
  model,
  recordId,
  editMode,
  onChange,
  onAction,
  onButtonAction,
  level,
  session,
  missingFields,
  fieldErrors,
}: {
  pages: { string: string; invisible?: string; elements: FormElement[] }[]
  record?: Record<string, unknown>
  fields: Record<string, OdooFieldMeta>
  model: string
  recordId?: number
  editMode?: boolean
  onChange?: (n: string, v: unknown) => void
  onAction?: (action: OdooAction) => void
  onButtonAction?: (btn: ButtonElement) => void
  level: number
  session?: GroupCheckSession
  missingFields?: Set<string>
  fieldErrors?: Map<string, string>
}) {
  const [activePage, setActivePage] = useState(0)
  const visiblePages = useMemo(
    () => pages.filter((p) => !evalModifier(p.invisible, record)),
    [pages, record],
  )
  const safeActive = Math.min(activePage, visiblePages.length - 1)

  const pageHasMissing = useMemo(() => {
    if (!editMode) return visiblePages.map(() => false)
    return visiblePages.map((page) => {
      const fieldEls = page.elements.filter((e) => e.type === 'field')
      return fieldEls.some((el) => {
        const fe = el as { type: 'field'; name: string }
        return missingFields?.has(fe.name) ?? false
      })
    })
  }, [visiblePages, editMode, missingFields])

  return (
    <div className="o_notebook mt-4">
      <div className="o_notebook_tabs flex border-b border-border-subtle">
        {visiblePages.map((page, pi) => (
          <button
            key={pi}
            type="button"
            onClick={() => setActivePage(pi)}
            className={`border-b-2 px-4 py-2 text-xs font-medium transition-colors ${pi === safeActive ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-default'}`}
          >
            {page.string}
            {pageHasMissing[pi] && (
              <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-danger" />
            )}
          </button>
        ))}
      </div>
      <div className="o_notebook_page py-4">
        {visiblePages[safeActive] && (
          <FormLayoutNode
            elements={visiblePages[safeActive].elements}
            record={record}
            fields={fields}
            model={model}
            recordId={recordId}
            editMode={editMode}
            onChange={onChange}
            onAction={onAction}
            onButtonAction={onButtonAction}
            session={session}
            level={level + 1}
            missingFields={missingFields}
            fieldErrors={fieldErrors}
          />
        )}
      </div>
    </div>
  )
}

// ── Form Layout Node ──────────────────────────────────────────────

export function FormLayoutNode({
  elements,
  record,
  fields,
  model,
  recordId,
  editMode,
  onChange,
  onAction,
  onButtonAction,
  level = 0,
  fieldGridSpan,
  session,
  missingFields,
  fieldErrors,
}: NodeProps) {
  return (
    <>
      {elements.map((el, i) => {
        switch (el.type) {
          case 'header':
            return null
          case 'sheet': {
            const { buttonBoxes, titleElements, avatarElements, body } = partitionSheetElements(
              el.elements,
            )
            const hasTop =
              buttonBoxes.length > 0 || titleElements.length > 0 || avatarElements.length > 0
            return (
              <div key={`sheet-${i}`}>
                {hasTop && (
                  <div className="o_form_sheet_top">
                    {avatarElements.length > 0 && (
                      <div className="o_form_avatar">
                        <FormLayoutNode
                          elements={avatarElements}
                          record={record}
                          fields={fields}
                          model={model}
                          recordId={recordId}
                          editMode={editMode}
                          onChange={onChange}
                          onAction={onAction}
                          onButtonAction={onButtonAction}
                          session={session}
                          level={level + 1}
                          missingFields={missingFields}
                          fieldErrors={fieldErrors}
                        />
                      </div>
                    )}
                    <div className="o_form_sheet_top_content">
                      {titleElements.length > 0 && (
                        <div className="o_form_title">
                          <FormLayoutNode
                            elements={titleElements}
                            record={record}
                            fields={fields}
                            model={model}
                            recordId={recordId}
                            editMode={editMode}
                            onChange={onChange}
                            onAction={onAction}
                            onButtonAction={onButtonAction}
                            session={session}
                            level={level + 1}
                            missingFields={missingFields}
                            fieldErrors={fieldErrors}
                          />
                        </div>
                      )}
                      {buttonBoxes.map((bb, bbi) => {
                        const visibleBtns = bb.buttons.filter((b) =>
                          isButtonVisible(b, record, session),
                        )
                        if (visibleBtns.length === 0) return null
                        return (
                          <ButtonBoxRenderer
                            key={`sheet-bbox-${bbi}`}
                            buttons={visibleBtns}
                            record={record}
                            model={model}
                            recordId={recordId}
                            inline
                          />
                        )
                      })}
                    </div>
                  </div>
                )}
                <FormLayoutNode
                  elements={body}
                  record={record}
                  fields={fields}
                  model={model}
                  recordId={recordId}
                  editMode={editMode}
                  onChange={onChange}
                  onAction={onAction}
                  onButtonAction={onButtonAction}
                  session={session}
                  level={level + 1}
                  missingFields={missingFields}
                  fieldErrors={fieldErrors}
                />
              </div>
            )
          }
          case 'title_block':
            return (
              <div key={`title-${i}`} className="o_form_title">
                <FormLayoutNode
                  elements={el.elements}
                  record={record}
                  fields={fields}
                  model={model}
                  recordId={recordId}
                  editMode={editMode}
                  onChange={onChange}
                  onAction={onAction}
                  onButtonAction={onButtonAction}
                  session={session}
                  level={level + 1}
                />
              </div>
            )
          case 'button': {
            const btn = el as ButtonElement
            if (!isButtonVisible(btn, record, session)) return null
            if (editMode) return null
            return (
              <div key={`btn-${i}`} className="flex items-center">
                <button
                  type="button"
                  onClick={() => onButtonAction?.(btn)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${btn.class?.includes('btn-primary') ? 'bg-accent text-on-accent hover:bg-accent/90 rounded' : 'text-text-secondary hover:bg-hover rounded border border-border-default'}`}
                >
                  {btn.icon && <span className="mr-1">{btn.icon}</span>}
                  {btn.string || btn.name}
                </button>
              </div>
            )
          }
          case 'button_box': {
            const bbe = el as ButtonBoxElement
            const visibleBtns = bbe.buttons.filter((b) => isButtonVisible(b, record, session))
            if (visibleBtns.length === 0) return null
            return (
              <ButtonBoxRenderer
                key={`bbox-${i}`}
                buttons={visibleBtns}
                record={record}
                model={model}
                recordId={recordId}
              />
            )
          }
          case 'layout_row':
            return (
              <div
                key={`layout-row-${i}`}
                id={el.id}
                className="o_form_layout_row mb-4 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6"
              >
                {el.columns.map((col: LayoutColumnElement, ci: number) => (
                  <div
                    key={`layout-col-${ci}`}
                    id={col.id}
                    className={`o_form_layout_column min-w-0 ${layoutColSpanClass(col.colSpan)} ${col.class?.includes('o_hr_column') ? 'o_hr_column' : ''}`}
                  >
                    <FormLayoutNode
                      elements={col.elements}
                      record={record}
                      fields={fields}
                      model={model}
                      recordId={recordId}
                      editMode={editMode}
                      onChange={onChange}
                      onAction={onAction}
                      onButtonAction={onButtonAction}
                      session={session}
                      level={level + 1}
                      missingFields={missingFields}
                      fieldErrors={fieldErrors}
                    />
                  </div>
                ))}
              </div>
            )
          case 'layout_column':
            return null
          case 'group': {
            if (!passesXmlGroups(el.groups, session)) return null
            if (evalModifier(el.invisible, record)) return null
            const col = Math.max(1, Math.min(el.col ?? 2, 6))
            if (isGroupColumnsLayout(el.elements)) {
              const childGroups = el.elements.filter((c): c is GroupElement => c.type === 'group')
              return (
                <div key={`grp-${i}`} className="o_group o_group_nested">
                  {el.string && (
                    <div className="o_horizontal_separator" style={{ gridColumn: '1 / -1' }}>
                      {el.string}
                    </div>
                  )}
                  <div
                    className="o_group_nested_row"
                    style={{ gridTemplateColumns: `repeat(${childGroups.length}, minmax(0, 1fr))` }}
                  >
                    {childGroups.map((child: GroupElement, ci: number) => {
                      if (evalModifier(child.invisible, record)) return null
                      const childCol = Math.max(1, Math.min(child.col ?? 1, 6))
                      return (
                        <div
                          key={`grp-${i}-col-${ci}`}
                          className="o_group_col"
                          data-cols={childCol}
                        >
                          {child.string && (
                            <div className="o_horizontal_separator mb-2">{child.string}</div>
                          )}
                          {renderGroupItems(child.elements, {
                            record,
                            fields,
                            model,
                            recordId,
                            editMode,
                            onChange,
                            onAction,
                            onButtonAction,
                            level: level + 1,
                            groupCol: childCol,
                            session,
                            missingFields,
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }
            return (
              <div
                key={`grp-${i}`}
                className="o_group"
                style={{ gridTemplateColumns: `repeat(${col}, minmax(0, 1fr))` }}
                data-cols={col}
              >
                {el.string && (
                  <div className="o_horizontal_separator" style={{ gridColumn: '1 / -1' }}>
                    {el.string}
                  </div>
                )}
                {renderGroupItems(el.elements, {
                  record,
                  fields,
                  model,
                  recordId,
                  editMode,
                  onChange,
                  onAction,
                  onButtonAction,
                  level: level + 1,
                  groupCol: col,
                  session,
                  missingFields,
                })}
              </div>
            )
          }
          case 'notebook':
            return (
              <NotebookRenderer
                key={`nb-${i}`}
                pages={el.pages}
                record={record}
                fields={fields}
                model={model}
                recordId={recordId}
                editMode={editMode}
                onChange={onChange}
                onAction={onAction}
                onButtonAction={onButtonAction}
                level={level}
                session={session}
                missingFields={missingFields}
                fieldErrors={fieldErrors}
              />
            )
          case 'field': {
            const meta = fields[el.name]
            if (!meta) return null
            if (!passesXmlGroups(el.groups, session)) return null
            if (evalModifier(el.invisible, record)) return null
            if (editMode && SYSTEM_FIELDS.has(el.name)) return null
            const Widget = getFieldWidget(el, meta.type)
            let fieldReadonly = !!meta.readonly
            if (el.readonly !== undefined)
              fieldReadonly =
                typeof el.readonly === 'string' ? evalModifier(el.readonly, record) : el.readonly
            const readOnly = !editMode || fieldReadonly
            let fieldRequired = !!meta.required
            if (el.required !== undefined)
              fieldRequired =
                typeof el.required === 'string' ? evalModifier(el.required, record) : el.required
            const deco = getDecoClass(el as unknown as Record<string, unknown>, record)
            const span = fieldGridSpan ?? el.colspan
            const colSpanStyle = span ? { gridColumn: `span ${span}` } : undefined
            const hasRequiredError = !!missingFields?.has(el.name)
            const hasTypeError = !!fieldErrors?.has(el.name)
            const errorRing = hasRequiredError
              ? ' ring-1 ring-danger ring-inset rounded'
              : hasTypeError
                ? ' ring-1 ring-warning ring-inset rounded'
                : ''
            const errorTitle = fieldErrors?.get(el.name) ?? undefined
            if (el.nolabel) {
              return (
                <div
                  key={`fld-${i}`}
                  className={`${deco ?? ''}${errorRing}`}
                  style={colSpanStyle}
                  data-field-name={el.name}
                  title={errorTitle}
                >
                  <Widget
                    field={el}
                    value={record?.[el.name]}
                    onChange={(v) => onChange?.(el.name, v)}
                    readOnly={readOnly}
                    meta={meta}
                    record={record}
                    model={model}
                    recordId={recordId}
                  />
                </div>
              )
            }
            if (meta.type === 'boolean') {
              return (
                <div
                  key={`bool-${i}`}
                  className={`flex items-center gap-2 ${deco ?? ''}${errorRing}`}
                  style={colSpanStyle}
                  data-field-name={el.name}
                  title={errorTitle}
                >
                  <Widget
                    field={el}
                    value={record?.[el.name]}
                    onChange={(v) => onChange?.(el.name, v)}
                    readOnly={readOnly}
                    meta={meta}
                    record={record}
                    model={model}
                    recordId={recordId}
                  />
                  <span className="o_form_label">
                    {el.string || meta.string || el.name}
                    {editMode && fieldRequired && <span className="ml-0.5 text-danger">*</span>}
                    {meta.help && <HelpPopover text={meta.help} />}
                  </span>
                </div>
              )
            }
            return (
              <div
                key={`fld-${i}`}
                className={`o_inner_group ${deco ?? ''}${errorRing}`}
                style={colSpanStyle}
                data-field-name={el.name}
                title={errorTitle}
              >
                <span className="o_form_label py-1">
                  {el.string || meta.string || el.name}
                  {editMode && fieldRequired && <span className="ml-0.5 text-danger">*</span>}
                  {meta.help && <HelpPopover text={meta.help} />}
                </span>
                <Widget
                  field={el}
                  value={record?.[el.name]}
                  onChange={(v) => onChange?.(el.name, v)}
                  readOnly={readOnly}
                  meta={meta}
                  record={record}
                  model={model}
                  recordId={recordId}
                />
              </div>
            )
          }
          case 'separator':
            return (
              <div key={`sep-${i}`} className="o_horizontal_separator col-span-full">
                {el.string}
              </div>
            )
          case 'newline':
            return <div key={`nl-${i}`} className="col-span-full" />
          case 'label':
            return (
              <span key={`lbl-${i}`} className="text-sm font-medium text-text-primary">
                {el.string}
              </span>
            )
          default:
            return null
        }
      })}
    </>
  )
}

const SYSTEM_FIELDS = new Set([
  'id',
  'create_date',
  'create_uid',
  'write_date',
  'write_uid',
  'display_name',
])
