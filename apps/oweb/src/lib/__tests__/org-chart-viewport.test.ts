import { describe, expect, test } from 'vitest'
import {
  clampOrgChartScale,
  nextScaleFromButton,
  nextScaleFromWheel,
  ORG_CHART_MAX_SCALE,
  ORG_CHART_MIN_SCALE,
} from '../org-chart-viewport'

describe('org-chart-viewport', () => {
  test('clampOrgChartScale bounds scale', () => {
    expect(clampOrgChartScale(0.1)).toBe(ORG_CHART_MIN_SCALE)
    expect(clampOrgChartScale(5)).toBe(ORG_CHART_MAX_SCALE)
    expect(clampOrgChartScale(1)).toBe(1)
  })

  test('nextScaleFromWheel zooms in on negative delta', () => {
    expect(nextScaleFromWheel(1, -100)).toBeGreaterThan(1)
  })

  test('nextScaleFromWheel zooms out on positive delta', () => {
    expect(nextScaleFromWheel(1, 100)).toBeLessThan(1)
  })

  test('nextScaleFromButton in/out are inverse-ish', () => {
    const up = nextScaleFromButton(1, 'in')
    const down = nextScaleFromButton(up, 'out')
    expect(down).toBeCloseTo(1, 5)
  })
})
