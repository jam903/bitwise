// Vitest setup: give tests jsdom's real localStorage.
//
// Node >= 25 defines its own global `localStorage` (Web Storage), which is
// `undefined` unless node runs with --localstorage-file. That global shadows
// jsdom's, so storage-backed tests failed with "Cannot read properties of
// undefined (reading 'clear')" on Node 26 (found 2026-11-13). Browsers are
// unaffected; this only repairs the test environment.
const dom = (globalThis as { jsdom?: { window: Window } }).jsdom

if (dom && typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: dom.window.localStorage,
    configurable: true,
  })
}
