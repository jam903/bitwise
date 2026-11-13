# Technical Debt

Workarounds and compromises, recorded so they don't accumulate in the dark (CLAUDE.md, "Technical Debt Tracking").

---

## TD-1: Test-only shim for Node's built-in `localStorage`

- **Issue**: Node ≥ 25 defines a global `localStorage` (Web Storage) that is `undefined` unless Node runs with `--localstorage-file`. Inside Vitest's jsdom environment, that global shadows jsdom's working `localStorage`, so every storage-backed test failed with `Cannot read properties of undefined (reading 'clear')`. Found 2026-11-13 on Node 26.8.2.
- **Location**: `src/test-setup.ts` (registered in `vitest.config.ts` → `setupFiles`)
- **Impact**: Tests only. Browsers are unaffected. CI pins Node 24, which doesn't have this global, so the shim is a no-op there. Each test worker also prints a harmless `ExperimentalWarning: localStorage is not available…`.
- **Workaround**: When the global is `undefined`, redefine it to jsdom's `window.localStorage`.
- **Fix**: Remove the shim once Vitest's jsdom environment overrides Node's Web Storage global itself (check after Vitest/Node upgrades: delete the setup file and run `npm run test:unit -- --run` on Node ≥ 25).
- **Priority**: Low
