export const ORG_CHART_MIN_SCALE = 0.25
export const ORG_CHART_MAX_SCALE = 2.5
export const ORG_CHART_ZOOM_STEP = 1.2

export interface ViewportTransform {
  scale: number
  x: number
  y: number
}

export function clampOrgChartScale(scale: number): number {
  return Math.min(ORG_CHART_MAX_SCALE, Math.max(ORG_CHART_MIN_SCALE, scale))
}

export function nextScaleFromWheel(current: number, deltaY: number): number {
  const factor = deltaY < 0 ? ORG_CHART_ZOOM_STEP : 1 / ORG_CHART_ZOOM_STEP
  return clampOrgChartScale(current * factor)
}

export function nextScaleFromButton(current: number, direction: 'in' | 'out'): number {
  const factor = direction === 'in' ? ORG_CHART_ZOOM_STEP : 1 / ORG_CHART_ZOOM_STEP
  return clampOrgChartScale(current * factor)
}

export const ORG_CHART_DEFAULT_TRANSFORM: ViewportTransform = { scale: 1, x: 0, y: 0 }
