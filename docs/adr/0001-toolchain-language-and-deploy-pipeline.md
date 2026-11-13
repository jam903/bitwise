<!-- adr template version: "adr 3.12.0" -->

# Toolchain, language, and deploy pipeline

- **Date**: 2026-11-13
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jana Mourad, Lexer 5.5

**TL;DR**: Vue 3 + Vite with scoped single-file components, Vitest, and a GitHub Actions deploy to Pages. Still open: TypeScript or JavaScript.

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
- Status: unanswered
- Why asking: The language is the hardest thing to change once code exists. It also changes the gate: TypeScript adds a type-check step that fails the build on type errors. The Vue starter (`npm create vue@latest`) offers TypeScript as a single yes/no prompt, so setup cost is the same either way. The real difference is what you write and read every day. The game's core is small: a hidden word, up to six guesses, and a per-letter state that's always one of three values (right place / wrong place / absent).
- Need: pick a letter (or override — any shape answers)

Options:
- **A — TypeScript**: `.vue` files use `<script setup lang="ts">`; the build fails on type errors. The three letter states become a closed type (`'correct' | 'present' | 'absent'`), so a typo like `'presnt'` is an error at build time, not a tile silently showing the wrong color. Cost: type syntax to learn and read, and some editor and compiler noise early on.
- **B — Plain JavaScript**: `<script setup>` with no types. Fewest concepts, closest to the Vue tutorials. Typos and wrong props only show up in tests or in the browser. Choose this if learning Vue itself is the goal and extra syntax would get in the way.
- **C — JavaScript + checked JSDoc**: plain `.js` with `// @ts-check` and `/** @type */` comments, so the editor flags type errors while the code stays JavaScript. A middle path, but the gate doesn't enforce it unless we add a separate check, and it's the least common style in Vue examples you'll find online.

**Recommendation**: (by Lexer 5.5, Claude Opus 5.5, 2026-11-13)

**A — TypeScript.** *Rationale*: The one data structure everything depends on (a guess scored into a fixed-length row of three-valued letter states) is exactly what union types make hard to get wrong. The starter scaffolds TypeScript with one prompt answer, and the type-check joins `npm run build` at no extra cost, so the Fifth Directive's gate catches a whole class of bug that would otherwise need hand-written tests. *Confidence*: 0.7, because this rests on general knowledge of Vue's tooling, not on anything run in this repo yet, and it depends on your background, which I don't know. That makes it your call. *If wrong*: if you've never used TypeScript and this project's main purpose is learning Vue and the deliberation method, the extra syntax becomes friction with no matching payoff in a game this small. Then this flips to **B**.

**ANS:** (by Jana Mourad)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

*Pending QST-LANGUAGE.* The scaffold and deploy choices under Assumptions stand unless Jana objects.

---

## Open Follow-ups

- [ ] **Concern: public name and look.** "Wordle" is a New York Times trademark, and in 2022 the NYT sent DMCA takedown notices for Wordle clones hosted on GitHub. The guess-a-word-with-colored-feedback mechanic is a genre (it predates Wordle, e.g. the TV game *Lingo*), but a public Pages site named "Wordle" that copies its look invites trouble. Proposal: give the game its own name and visual identity before the first public deploy. The repo name also sets the Pages URL and the Vite `base`, so rename the repo before setting `base`, not after. (GitHub redirects old repo URLs, but not old Pages URLs.)
- [ ] **Concern: Pages on a free account requires a public repo.** That makes this whole deliberation record public too: ADRs, CLAUDE.md, and the crew registry. Nothing sensitive is in it today; worth knowing before writing anything personal into an ADR.
- [ ] **Unverified assumption**: `kintsugi` (the template's update tool) isn't installed, so `just gate` currently exits 2 on its "no kintsugi.lock" warning even though the placeholder and registry checks pass. Either install it and run `kintsugi adopt`, or decide that warnings shouldn't fail the gate.

---

## Action Items

- [ ] Answer QST-LANGUAGE - Owner: Jana Mourad
- [ ] Scaffold with `npm create vue@latest` per the answer; set `base`; add the deploy workflow - Owner: Lexer 5.5
- [ ] Extend `just gate` with the app test + build steps; update CLAUDE.md's Fifth Directive to match - Owner: Lexer 5.5

---

## Iterations

### Iteration 1 (2026-11-13)
- Trigger: Initial draft from Jana's project brief (above)
- Contributors: Lexer 5.5 (Claude Opus 5.5)
- Changes: Laid out the toolchain assumptions; asked QST-LANGUAGE
- Outcome: Draft; awaiting Jana's answer

---

## Links

- Related ADRs: ADR-0002 (word lists: bundle size depends on the guess list), ADR-0003 (game mode and saved state)
- Related code: none yet
