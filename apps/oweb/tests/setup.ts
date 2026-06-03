import '@testing-library/jest-dom/vitest'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')

if (!globalThis.DOMParser) {
  // @ts-expect-error DOMParser from jsdom window
  globalThis.DOMParser = dom.window.DOMParser
}
