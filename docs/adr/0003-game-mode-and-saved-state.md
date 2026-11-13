<!-- adr template version: "adr 3.12.0" -->

# Game mode and saved state

- **Date**: 2026-11-13
- **Iteration**: 5
- **Status**: Implemented
- **Deciders**: Jana Mourad (decided), Lexer 5.5 (recommended; made the implementation choices listed under Provenance)

**TL;DR**: Unlimited play: each game picks a random CS answer through `pickAnswer()`, the seam for a possible future daily mode. The in-progress game (including hints used, per ADR-0004) and the stats live in the browser's localStorage. No server, no accounts.

---

## Originating Context

**Source**: Human dump (Jana Mourad, 2026-11-13). Full text in ADR-0001. The brief doesn't say how often a new puzzle appears; that silence is why this ADR exists.

**Agency Grant**: Explore options and recommend; no code until the questions are answered.

---

## Explicitation

**What I understand**:

1. **Game mode decides the shape of the state.** A daily puzzle needs date logic and "already played today" tracking. Unlimited play needs a "new game" button and nothing else. That difference shows up in the data model on day one.
2. **Static hosting rules out a server.** With no backend, a "daily" word must be computed in the browser from the date and the answer list. Nothing is kept secret or synced across devices.

**Assumptions** (please confirm or override):

- **Saved state in localStorage**: the in-progress game survives a page reload, and win/loss stats and streaks are kept per browser. No accounts, no sync between devices.
- **Spoilers are acceptable**: the answer list ships inside the site's code, so a determined player can read it in devtools. Hiding it would take a server, which free Pages doesn't have. Light obfuscation keeps casual eyes off it but isn't security.

**Confirm**: Jana Mourad: the two assumptions, plus the question below.

---

## Questions

### QST-GAME-MODE: Should the game offer a daily puzzle, unlimited play, or both?
- Status: answered
- Why asking: This sets how an answer is chosen, what gets saved, and what the end-of-game screen offers ("come back tomorrow" vs. "play again"). The CS answer list is likely small (an estimated 100–250 words; see ADR-0002), which matters: a daily puzzle uses up one word per day, and unlimited play uses one per game.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — Daily puzzle**: one answer per calendar day, the same for every player, computed from the date (no server). One game per day; stats and streaks saved per browser. Players can compare results, which is the social hook. Needs a timezone rule (local midnight vs. UTC). A 200-word list runs out in about 200 days, then repeats.
- **B — Unlimited play**: a random answer each game, with a "new game" button. The simplest model: no date logic, no "come back tomorrow." Good for playtesting the word list fast. Players don't share one puzzle, so there's nothing to compare.
- **C — Both**: daily as the main mode plus an unlimited practice mode. The most complete experience, but two progress records, a mode switch in the UI, and roughly double the state handling to test.

**Recommendation**: (by Lexer 5.5, Claude Opus 5.5, 2026-11-13)

**B — Unlimited play, built so daily can be added.** *Rationale*: All word selection goes through one function (`pickAnswer()`), so adding a daily mode later (moving to C) is an addition, not a rewrite. Unlimited play is also what you'll want while building: you'll play dozens of rounds a day to find bad words in the list (ADR-0002's curation assumption), and a daily mode would allow one test round per day. It also avoids spending a small answer list one word per day before the list has been tested. *Confidence*: 0.65, because the technical argument is solid but the choice really depends on who the game is for, which I don't know. That makes it your call. *If wrong*: if the point is to share it with classmates or friends as a daily ritual ("did you get today's?"), the shared puzzle *is* the product, and this flips to **A** (or **C**, if you also want practice rounds).

**ANS:** (by Jana Mourad)
B — unlimited play, built so a daily mode can be added later, as recommended. I also approve the assumptions (state and stats in localStorage, no accounts; the answer list being readable in the site's code is acceptable). (Given in chat 2026-11-13; recorded by Lexer 5.5.)

---

## Decision

### Context
The game needs to decide how answers are chosen and what is remembered between visits.

### Chosen: unlimited play, state in localStorage

- Each game picks a random answer through one function, `pickAnswer()`, so a daily mode can later be added by giving it a date-based picker.
- The in-progress game survives a reload; stats (played, wins, streaks, guess distribution) are kept per browser.
- The end-of-game panel offers "play again".

**Rationale**: Jana accepted the recommendation (QST-GAME-MODE → B) and both assumptions on 2026-11-13. The only reasoning on record is Lexer 5.5's, in the Recommendation above. [Missing: Jana's own reasons. She approved "as recommended" without stating any.]

**Trade-offs accepted**: no shared "today's word" (option B's description); stats are lost if the browser storage is cleared (follows from the localStorage assumption); the answer list is readable in the site's code (the "Spoilers are acceptable" assumption, which Jana approved).

### Rejected alternatives

*Reasons below come from this record (option descriptions, the Recommendation, the assumptions). None were stated by Jana.*

- **A — Daily puzzle** (QST-GAME-MODE). Not chosen *for now*. Recommendation: while the word list is being built, unlimited play allows many test rounds a day to find bad words, where daily allows one; and a daily mode would spend a small, untested answer list one word per day. Deferred rather than ruled out: `pickAnswer()` is the seam for adding it.
- **C — Both** (QST-GAME-MODE). Not chosen now. The Recommendation describes adding daily later as "moving to C … an addition, not a rewrite." The option's cost, as recorded: two progress records, a mode switch in the UI, and roughly double the state handling to test.
- **Light obfuscation of the answer list** (Explicitation: "keeps casual eyes off it but isn't security"). Not implemented. [Missing: an explicit ruling. Jana approved "spoilers are acceptable" but said nothing about obfuscation either way.]

### Reopen if

*The only recorded condition is the Recommendation's* If wrong *line. Jana stated no reopening conditions of her own.*

- **Switch to A (daily), or C if practice rounds are also wanted**, if the point becomes sharing the game with classmates or friends as a daily ritual ("did you get today's?").
- [Missing: no reopening condition was recorded for storing state in localStorage instead of on a server.]

### Provenance

- **Ruled by Jana** (chat, 2026-11-13): option B; state and stats in localStorage with no accounts; spoilers acceptable. The `hints` field in the saved game follows from an ADR-0004 assumption she approved ("hint state saved with the game").
- **Chosen by Lexer 5.5 during implementation, not ruled on by Jana:**
  - `pickAnswer()` never repeats the previous answer.
  - Stats are recorded only on the submit that ends a game.
  - Every saved read is validated, and corrupted data starts a fresh game.
  - The storage key names.
  - Keeping the `…:game:v1` key when `hints` was added, with games saved earlier loading as 0 hints used (iteration 4).

### Consequences
- If storage is unavailable (private mode, blocked), the game still plays; it just forgets.

---

## Open Follow-ups

- [ ] Future task (only if A or C): pick the timezone rule and the date→word mapping, ideally a shuffled order so the daily sequence isn't alphabetical
- [ ] Concern: localStorage can be cleared by the browser or the player; stats are best-effort, not a record

---

## Action Items

- [x] Answer QST-GAME-MODE and confirm the two assumptions - Owner: Jana Mourad
- [x] Design the game-state shape (current game, stats) per the answer - Owner: Lexer 5.5

---

## Iterations

### Iteration 1 (2026-11-13)
- Trigger: Initial draft from Jana's project brief
- Contributors: Lexer 5.5 (Claude Opus 5.5)
- Changes: Laid out the mode options and state assumptions; asked QST-GAME-MODE
- Outcome: Draft; awaiting Jana's answer

### Iteration 2 (2026-11-13)
- Trigger: Jana's answer in chat (approved all recommendations and assumptions)
- Contributors: Jana Mourad, Lexer 5.5 (Claude Opus 5.5)
- Changes: Recorded the answer (B — unlimited play); filled the Decision
- Outcome: `Draft → Accepted`

### Iteration 3 (2026-11-13)
- Trigger: Implementation
- Contributors: Lexer 5.5 (Claude Opus 5.5)
- Changes:
  - `src/game/useGame.ts` (Vue composable) holds the state; `pickAnswer()` in `words.ts` is the daily-mode seam and never repeats the previous word.
  - `src/game/storage.ts` saves `{ answer, guesses }` and the stats under versioned keys. Every read is validated, so corrupted or old data starts a fresh game instead of crashing. Letter colors are recomputed from the guesses, never stored.
  - Stats change only on the submit that ends a game, so reloading a finished game never counts it twice (tested).
- Outcome: `Accepted → Implemented`

### Iteration 4 (2026-11-13)
- Trigger: ADR-0004 (hint button) added a field to the saved game
- Contributors: Lexer 5.5 (Claude Opus 5.5)
- Changes: The saved game is now `{ answer, guesses, hints }`. The storage key stays `…:game:v1`, because `hints` is optional: games saved before the change load with 0 hints used (tested), so players mid-game during the deploy keep their game. Stats format unchanged.
- Outcome: no status change (still Implemented)

### Iteration 5 (2026-11-13)
- Trigger: Jana's cold-resumption test, which found documentation gaps (rejected alternatives, reopening conditions, outdated TL;DRs, iteration numbering)
- Contributors: Lexer 5.5 (Claude Opus 5.5), drawing only on what this record and the chat already contain
- Changes:
  - **Fixed the iteration mismatch**: iteration 4 was added without bumping the header, which still said `Iteration: 3`. The header now matches this entry (5).
  - Rewrote the TL;DR (the iteration-1 draft still said "Still open: daily puzzle, unlimited play, or both"). It now also mentions the `hints` field from iteration 4.
  - Added **Rejected alternatives**, **Reopen if**, and **Provenance** to the Decision, marking missing information `[Missing: …]`. Added the ADR-0004 link.
- Outcome: no status change (still Implemented). No decision changed.

---

## Links

- Related ADRs: ADR-0001 (toolchain), ADR-0002 (the answer list this mode draws from), ADR-0004 (adds the `hints` field to the saved game)
- Related code: `src/game/useGame.ts`, `src/game/storage.ts`, `src/game/stats.ts`, `src/game/words.ts` (`pickAnswer`)
