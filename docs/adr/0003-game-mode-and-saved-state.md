<!-- adr template version: "adr 3.12.0" -->

# Game mode and saved state

- **Date**: 2026-11-13
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jana Mourad, Lexer 5.5

**TL;DR**: Game state and stats live in the player's browser (localStorage); there's no server. Still open: daily puzzle, unlimited play, or both.

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
- Status: unanswered
- Why asking: This sets how an answer is chosen, what gets saved, and what the end-of-game screen offers ("come back tomorrow" vs. "play again"). The CS answer list is likely small (an estimated 100–250 words; see ADR-0002), which matters: a daily puzzle uses up one word per day, and unlimited play uses one per game.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — Daily puzzle**: one answer per calendar day, the same for every player, computed from the date (no server). One game per day; stats and streaks saved per browser. Players can compare results, which is the social hook. Needs a timezone rule (local midnight vs. UTC). A 200-word list runs out in about 200 days, then repeats.
- **B — Unlimited play**: a random answer each game, with a "new game" button. The simplest model: no date logic, no "come back tomorrow." Good for playtesting the word list fast. Players don't share one puzzle, so there's nothing to compare.
- **C — Both**: daily as the main mode plus an unlimited practice mode. The most complete experience, but two progress records, a mode switch in the UI, and roughly double the state handling to test.

**Recommendation**: (by Lexer 5.5, Claude Opus 5.5, 2026-11-13)

**B — Unlimited play, built so daily can be added.** *Rationale*: All word selection goes through one function (`pickAnswer()`), so adding a daily mode later (moving to C) is an addition, not a rewrite. Unlimited play is also what you'll want while building: you'll play dozens of rounds a day to find bad words in the list (ADR-0002's curation assumption), and a daily mode would allow one test round per day. It also avoids spending a small answer list one word per day before the list has been tested. *Confidence*: 0.65, because the technical argument is solid but the choice really depends on who the game is for, which I don't know. That makes it your call. *If wrong*: if the point is to share it with classmates or friends as a daily ritual ("did you get today's?"), the shared puzzle *is* the product, and this flips to **A** (or **C**, if you also want practice rounds).

**ANS:** (by Jana Mourad)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

*Pending QST-GAME-MODE.*

---

## Open Follow-ups

- [ ] Future task (only if A or C): pick the timezone rule and the date→word mapping, ideally a shuffled order so the daily sequence isn't alphabetical
- [ ] Concern: localStorage can be cleared by the browser or the player; stats are best-effort, not a record

---

## Action Items

- [ ] Answer QST-GAME-MODE and confirm the two assumptions - Owner: Jana Mourad
- [ ] Design the game-state shape (current game, stats) per the answer - Owner: Lexer 5.5

---

## Iterations

### Iteration 1 (2026-11-13)
- Trigger: Initial draft from Jana's project brief
- Contributors: Lexer 5.5 (Claude Opus 5.5)
- Changes: Laid out the mode options and state assumptions; asked QST-GAME-MODE
- Outcome: Draft; awaiting Jana's answer

---

## Links

- Related ADRs: ADR-0001 (toolchain), ADR-0002 (the answer list this mode draws from)
