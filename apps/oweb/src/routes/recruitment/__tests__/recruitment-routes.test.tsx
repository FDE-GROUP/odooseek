import { describe, expect, test } from 'vitest'
import { resolveMenuRoute } from '../../../lib/menu-navigation'

describe('recruitment routes', () => {
  test('recruitment menu → /recruitment/applicants', () => {
    expect(
      resolveMenuRoute({
        xmlid: 'hr_recruitment.menu_hr_recruitment_root',
        resModel: 'hr.applicant',
      }),
    ).toMatchObject({ kind: 'module', to: '/recruitment/applicants' })
  })

  test('hr.applicant by resModel → /recruitment/applicants', () => {
    expect(resolveMenuRoute({ resModel: 'hr.applicant' })).toMatchObject({
      kind: 'module',
      to: '/recruitment/applicants',
    })
  })

  test('hr.recruitment.stage → /recruitment/stages', () => {
    expect(resolveMenuRoute({ resModel: 'hr.recruitment.stage' })).toMatchObject({
      kind: 'module',
      to: '/recruitment/stages',
    })
  })
})
