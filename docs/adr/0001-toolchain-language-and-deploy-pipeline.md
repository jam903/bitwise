<!-- adr template version: "adr 3.12.0" -->

# Toolchain, language, and deploy pipeline

- **Date**: 2026-11-13
- **Iteration**: 5
- **Status**: Implemented
- **Deciders**: Jana Mourad (decided), Lexer 5.5 (recommended; made the implementation choices listed under Provenance)

**TL;DR**: TypeScript + Vue 3 (scoped single-file components) + Vite + Vitest, deployed to GitHub Pages by GitHub Actions on every push to `main`; repo renamed to `bitwise`; live at https://jam903.github.io/bitwise/.

---

## Originating Context

**Source**: Human dump (Jana Mourad, session of 2026-11-13):

> The project is a Wordle variant — guess the word, colored feedback per letter — with a twist: the answers are computer science words (ARRAY, STACK, QUEUE, CACHE, TOKEN…). I want it hosted free on GitHub Pages, built with Vue using scoped CSS so styles stay component-local. Before you write any code: what are the 2–3 decisions we should settle first?

**Agency Grant**: Explore options and recommend; no code until the questions are answered.

---

## Explicitation

**What I understand**:

1. **Vue with scoped CSS is already decided.** Every component is a `.vue` single-file component, and its styles go in `<style scoped>`, so a `.tile` class in one component can never leak into another.
2. **Hosting must be free and static.** GitHub Pages serves files and runs no server. Everything (word lists, game logic, saved stats) lives in the browser.
3. **This record also sets the verification gate.** CLAUDE.md's Fifth Directive names `just gate`. Today that only checks the template. This ADR decides what app checks get added to it.

**Assumptions** (I'll proceed on these unless you object; none needs its own question):

- **Scaffold**: `npm create vue@latest` (the official Vue starter, which uses Vite), with Vitest for unit tests. No router, Pinia, or end-to-end tests yet: a single-screen game doesn't need them.
- **Deploy**: GitHub's official Pages workflow (`actions/upload-pages-artifact` + `actions/deploy-pages`) builds and publishes on every push to `main`. That beats committing a built `dist/` folder or keeping a `gh-pages` branch, because nobody builds by hand.
- **Base path**: a project site is served at `https://<user>.github.io/<repo>/`, so Vite needs `base: '/<repo>/'`. If that's wrong, the page loads blank because every asset 404s. The gate's `npm run build` won't catch a wrong base; only the first real deploy will. That makes the repo name a config value (see Open Follow-ups).
- **Gate after scaffolding**: `just gate` = template checks + `npm run test:unit -- --run` + `npm run build`. With TypeScript, `build` also runs `vue-tsc` type-checking.

**Confirm**: Jana Mourad: the assumptions above, plus the one question below.

---

## Questions

### QST-LANGUAGE: Should the Vue app be written in TypeScript or plain JavaScript?
- Status: answered
- Why asking: The language is the hardest thing to change once code exists. It also changes the gate: TypeScript adds a type-check step that fails the build on type errors. The Vue starter (`npm create vue@latest`) offers TypeScript as a single yes/no prompt, so setup cost is the same either way. The real difference is what you write and read every day. The game's core is small: a hidden word, up to six guesses, and a per-letter state that's always one of three values (right place / wrong place / absent).
- Need: pick a letter (or override — any shape answers)

Options:
- **A — TypeScript**: `.vue` files use `<script setup lang="ts">`; the build fails on type errors. The three letter states become a closed type (`'correct' | 'present' | 'absent'`), so a typo like `'presnt'` is an error at build time, not a tile silently showing the wrong color. Cost: type syntax to learn and read, and some editor and compiler noise early on.
- **B — Plain JavaScript**: `<script setup>` with no types. Fewest concepts, closest to the Vue tutorials. Typos and wrong props only show up in tests or in the browser. Choose this if learning Vue itself is the goal and extra syntax would get in the way.
- **C — JavaScript + checked JSDoc**: plain `.js` with `// @ts-check` and `/** @type */` comments, so the editor flags type errors while the code stays JavaScript. A middle path, but the gate doesn't enforce it unless we add a separate check, and it's the least common style in Vue examples you'll find online.

**Recommendation**: (by Lexer 5.5, Claude Opus 5.5, 2026-11-13)

**A — TypeScript.** *Rationale*: The one data structure everything depends on (a guess scored into a fixed-length row of three-valued letter states) is exactly what union types make hard to get wrong. The starter scaffolds TypeScript with one prompt answer, and the type-check joins `npm run build` at no extra cost, so the Fifth Directive's gate catches a whole class of bug that would otherwise need hand-written tests. *Confidence*: 0.7, because this rests on general knowledge of Vue's tooling, not on anything run in this repo yet, and it depends on your background, which I don't know. That makes it your call. *If wrong*: if you've never used TypeScript and this project's main purpose is learning Vue and the deliberation method, the extra syntax becomes friction with no matching payoff in a game this small. Then this flips to **B**.

**ANS:** (by Jana Mourad)
A — TypeScript, as recommended. I also approve the assumptions listed under Explicitation (create-vue scaffold + Vitest, GitHub Actions deploy, base path, gate = template checks + unit tests + build). (Given in chat 2026-11-13; recorded by Lexer 5.5.)

---

## Decision

### Context
The game needs a toolchain before any code: a language, a test runner, a build, and a way onto GitHub Pages that nobody has to run by hand.

### Chosen: TypeScript + Vue 3 + Vite + Vitest, deployed by GitHub Actions

- `.vue` single-file components with `<script setup lang="ts">` and `<style scoped>`.
- Vitest unit tests; `vue-tsc` type-check runs as part of `npm run build`.
- The official Pages workflow (`configure-pages` → `upload-pages-artifact` → `deploy-pages`) builds and publishes on every push to `main`.
- `just gate` = template checks + `npm run test:unit -- --run` + `npm run build`.

**Rationale**: Jana accepted the recommendation (QST-LANGUAGE → A) and every Explicitation assumption on 2026-11-13. The only reasoning on record is Lexer 5.5's, in the Recommendation above. [Missing: Jana's own reasons. She approved "as recommended" without stating any.]

**Trade-offs accepted**: type syntax to learn; the build fails on type errors even when the app would run. (Both come from option A's description, which Jana chose.)

### Rejected alternatives

*Reasons below are quoted or paraphrased from this record (option descriptions, the Recommendation, the assumptions). None were stated by Jana.*

- **B — Plain JavaScript** (QST-LANGUAGE). Not chosen. The recorded case is the Recommendation's case *for* A: letter states as a closed type, with type errors caught by the gate's build. The option itself notes that in JavaScript "typos and wrong props only show up in tests or in the browser."
- **C — JavaScript + checked JSDoc** (QST-LANGUAGE). Not chosen. The only recorded reasons are in the option's own description: the gate wouldn't enforce it without a separate check, and it's the least common style in Vue examples. [Missing: the Recommendation never addressed C directly.]
- **Committing a built `dist/` folder, or a `gh-pages` branch** (Deploy assumption, approved by Jana). Rejected because the Actions workflow means "nobody builds by hand."
- **A hard-coded `base: '/<repo>/'`** (Base-path assumption, approved by Jana). Replaced during implementation by `BASE_PATH` read from `actions/configure-pages`, so renaming the repo can't silently break the site (iteration 3). This was Lexer 5.5's change; see Provenance.
- **Keeping the repo name `wordle-with-records`** (iteration 4). When offered both, Jana chose to rename to `bitwise` (chat, 2026-11-13). The recorded reasons are Lexer 5.5's option text: the address matches the game's name and keeps "Wordle" out of the public URL (the trademark concern in Open Follow-ups). [Missing: Jana's own reasons.]
- **A router, Pinia, end-to-end tests** (Scaffold assumption). Not adopted for now: "a single-screen game doesn't need them."

### Reopen if

*The only recorded condition is the Recommendation's* If wrong *line. Jana stated no reopening conditions of her own.*

- **Switch to B (JavaScript)** if TypeScript proves to be friction without payoff. The recorded condition: Jana has never used TypeScript, and the project's main purpose is learning Vue and the deliberation method. [Missing: neither Jana's TypeScript background nor the project's main purpose was ever stated, so whether this condition already holds is unknown.]
- [Missing: no reopening condition was recorded for the deploy pipeline, the base-path approach, the repo name, or the game name.]

### Provenance

- **Ruled by Jana** (chat, 2026-11-13): TypeScript (QST-LANGUAGE → A); the four Explicitation assumptions; the game name "Bitwise" (Lexer 5.5's working title, which Jana adopted); renaming the repo to `bitwise`; enabling Pages and pushing (she asked for both).
- **Chosen by Lexer 5.5 during implementation, not explicitly ruled on by Jana:**
  - `BASE_PATH` from `configure-pages` instead of a hard-coded base. Reported to Jana in chat; she didn't comment.
  - `src/assets/base.css` as the one global stylesheet, an exception to her "scoped CSS so styles stay component-local." Raised with her in chat as a departure from her request. [Missing: Jana's ruling.]
  - Node 24 in CI; `just gate` running app checks before template checks; scaffolding create-vue in a scratch directory; the test-only `localStorage` shim (`docs/TECHNICAL-DEBT.md`, TD-1).
  - [Missing: Jana's ruling on the kintsugi warning that keeps `just gate` red; see Open Follow-ups.]

### Consequences
- One closed type for letter states (`'correct' | 'present' | 'absent'`) shared by scoring, board, and keyboard.
- The deploy needs a one-time repo setting: Settings → Pages → Source: **GitHub Actions**.

---

## Open Follow-ups

- [x] **Resolved 2026-11-13: the game is named Bitwise** (Jana Mourad, in chat), with its own palette and type. **Concern: public name and look.** "Wordle" is a New York Times trademark, and in 2022 the NYT sent DMCA takedown notices for Wordle clones hosted on GitHub. The guess-a-word-with-colored-feedback mechanic is a genre (it predates Wordle, e.g. the TV game *Lingo*), but a public Pages site named "Wordle" that copies its look invites trouble. Proposal: give the game its own name and visual identity before the first public deploy. The repo name also sets the Pages URL and the Vite `base`, so rename the repo before setting `base`, not after. (GitHub redirects old repo URLs, but not old Pages URLs.)
- [ ] **Concern: Pages on a free account requires a public repo.** That makes this whole deliberation record public too: ADRs, CLAUDE.md, and the crew registry. Nothing sensitive is in it today; worth knowing before writing anything personal into an ADR.
- [ ] **Unverified assumption**: `kintsugi` (the template's update tool) isn't installed, so `just gate` currently exits 2 on its "no kintsugi.lock" warning even though the placeholder and registry checks pass. Either install it and run `kintsugi adopt`, or decide that warnings shouldn't fail the gate.

---

## Action Items

- [x] Answer QST-LANGUAGE - Owner: Jana Mourad
- [x] Scaffold with `npm create vue@latest` per the answer; set `base`; add the deploy workflow - Owner: Lexer 5.5
- [x] Extend `just gate` with the app test + build steps; update CLAUDE.md's Fifth Directive to match - Owner: Lexer 5.5
- [x] Rename the repo to `bitwise` so the address matches the game (Jana chose this 2026-11-13; site: https://jam903.github.io/bitwise/) - Owner: Lexer 5.5
- [x] Enable Pages (Source: GitHub Actions) and push `main` for the first deploy - Owner: Lexer 5.5, approved by Jana Mourad
- [x] Choose the public game name before the first public deploy: **Bitwise** (Jana, 2026-11-13) - Owner: Jana Mourad

---

## Iterations

### Iteration 1 (2026-11-13)
- Trigger: Initial draft from Jana's project brief (above)
- Contributors: Lexer 5.5 (Claude Opus 5.5)
- Changes: Laid out the toolchain assumptions; asked QST-LANGUAGE
- Outcome: Draft; awaiting Jana's answer

### Iteration 2 (2026-11-13)
- Trigger: Jana's answer in chat ("I approve your recommendations … I also approve the smaller assumptions")
- Contributors: Jana Mourad, Lexer 5.5 (Claude Opus 5.5)
- Changes: Recorded the answer (A — TypeScript) and the approved assumptions; filled the Decision
- Outcome: `Draft → Accepted`

### Iteration 3 (2026-11-13)
- Trigger: Implementation
- Contributors: Lexer 5.5 (Claude Opus 5.5)
- Changes:
  - Scaffolded by running create-vue (`--ts --vitest --bare`) in a scratch directory and copying only its config files, because create-vue empties a non-empty target directory.
  - **Refinement of the base-path assumption**: instead of hard-coding `base: '/wordle-with-records/'`, `vite.config.ts` reads `BASE_PATH`, which `.github/workflows/deploy.yml` takes from `actions/configure-pages`. Renaming the repo (see Open Follow-ups) therefore can't silently break the site. Locally the base is `/`; verified that a build with `BASE_PATH=/wordle-with-records` prefixes every asset URL.
  - **Scoped CSS, one exception**: every component uses `<style scoped>`. The only global CSS is `src/assets/base.css`, which holds the color/font tokens (CSS custom properties, light + dark) and the page reset. Tokens have to be global for components to share one palette.
  - `just gate` now runs app tests + type-check/build first, then the template checks.
  - CI uses Node 24 (current LTS); local development ran on Node 26 (see `docs/TECHNICAL-DEBT.md` for the one difference that mattered).
- Outcome: `Accepted → Partially Implemented`. The deploy workflow is written but has never run, because nothing has been pushed. It becomes Implemented after the first successful Pages deploy.

### Iteration 4 (2026-11-13)
- Trigger: Jana named the game Bitwise and asked for it to go online
- Contributors: Jana Mourad, Lexer 5.5 (Claude Opus 5.5)
- Changes:
  - Jana chose to rename the repo `wordle-with-records` → `bitwise` (via `gh repo rename`; local remote updated). No code change was needed, which validates iteration 3's base-path refinement.
  - Enabled Pages with `build_type=workflow` *before* the first push, since `configure-pages` fails on a repo without Pages.
  - Pushed `main`. Workflow run 43468132874 passed tests, type-check, build, and deploy.
  - Verified live: https://jam903.github.io/bitwise/ serves `/bitwise/assets/*` (all 200), and a headless-Chrome render shows the board and keyboard.
  - The run warned that the pinned action majors target the deprecated Node 20 runtime; logged as TD-2.
- Outcome: `Partially Implemented → Implemented`

### Iteration 5 (2026-11-13)
- Trigger: Jana's cold-resumption test. A fresh Claude session recovered the decisions but found documentation gaps: no explicit rejected alternatives, no reopening conditions, outdated TL;DRs, inconsistent iteration numbers.
- Contributors: Lexer 5.5 (Claude Opus 5.5), drawing only on what this record and the chat already contain
- Changes:
  - Rewrote the TL;DR. The old one ("… Still open: TypeScript or JavaScript.") was the iteration-1 draft and went stale once QST-LANGUAGE was answered.
  - Added **Rejected alternatives**, **Reopen if**, and **Provenance** to the Decision, marking missing information `[Missing: …]` instead of filling it in.
  - Made attribution explicit: the Rationale now says the reasoning on record is Lexer 5.5's, and that Jana gave none of her own. The Deciders line now gives each person's role.
  - Replaced the stale "Related code: none yet" in Links.
- Outcome: no status change (still Implemented). No decision changed.

---

## Links

- Related ADRs: ADR-0002 (word lists: bundle size depends on the guess list), ADR-0003 (game mode and saved state)
- Related code: `package.json`, `vite.config.ts` (`BASE_PATH`), `vitest.config.ts`, `tsconfig*.json`, `.github/workflows/deploy.yml`, `justfile` (`gate` recipe), `src/assets/base.css`
- Related docs: `docs/TECHNICAL-DEBT.md` (TD-1 test shim, TD-2 action majors)
