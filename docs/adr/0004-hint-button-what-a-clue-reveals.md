<!-- adr template version: "adr 3.12.0" -->

# Hint button: what a clue reveals

- **Date**: 2026-11-13
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jana Mourad, Lexer 5.5

**TL;DR**: Add a hint button that gives a clue about the hidden CS word. Still open: what the clue reveals, which decides how much clue text gets written and fact-checked.

---

## Originating Context

**Source**: Human request (Jana Mourad, 2026-11-13):

> I'd like to add a hint button to Bitwise that gives players a clue about the computer science word they're guessing. If there's an important design decision, create a QST card first. Otherwise, please implement it, test it, and deploy the updated game to GitHub Pages.

**Agency Grant**: Implement freely once the design decision is settled; ask first on anything that shapes the game.

---

## Explicitation

**What I understand**:

1. **The clue is about the word's CS meaning**, not just its letters. "A clue about the computer science word" points at what the term *means*, which is the game's twist.
2. **Clues are new content.** Right now the game has only the 117 words in `src/game/data/answers.txt`. Any meaning-based clue has to be written per word and checked for accuracy, and the person best placed to check CS definitions is you.
3. **A hint changes difficulty.** The more it gives away, the more it turns the puzzle into a quiz.

**Assumptions** (I'll proceed on these unless you object; none needs its own question):

- **Placement**: a "Hint" button between the board and the keyboard, usable by mouse, touch, and keyboard. The clue appears as a line of text above the board and is announced to screen readers.
- **Availability**: available from the first guess. Once used, the clue stays visible for the rest of that game.
- **Saved with the game**: reloading the page keeps the hint state, so reloading can't hand out a free second hint or hide one already used (ADR-0003's saved state gains one field).
- **Stats**: using a hint doesn't change win/loss or streaks. The result panel says "solved with a hint". No new stats counter, so the stats format stays the same.
- **Data**: the clue lives next to each word in one data file, so adding a word means adding its clue in the same place, and a unit test fails if any answer lacks one.

**Confirm**: Jana Mourad: the assumptions above, plus the question below.

---

## Questions

### QST-HINT-CONTENT: What should the hint reveal about the hidden word?
- Status: unanswered
- Why asking: This decides how much the hint helps, how much text has to be written (one clue per answer, 117 answers today), and how much you'll need to review. Examples below use STACK and MUTEX.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — Category**: one short topic tag per word, e.g. STACK → "data structure", MUTEX → "concurrency". A gentle nudge that narrows the field without naming the word. About a dozen tags shared across 117 words; quick to write and easy to check.
- **B — Definition**: a one-line meaning per word, e.g. STACK → "Last in, first out: you push onto the top and pop from the top", MUTEX → "A lock that lets only one thread into a critical section at a time". Strong: a CS student will often get the word straight away. 117 distinct lines to write and fact-check.
- **C — Letter reveal**: show one letter of the answer in its correct place that the player hasn't found yet. Needs no content and works for any word, but it says nothing about CS: it's a generic puzzle hint, not a clue about the word.
- **D — Two steps: category, then definition**: first press shows the category (A); a second press shows the definition (B). Players choose how much help they want. The most content to write (both A and B). Since the definitions exist anyway, the result panel can also show the word's meaning, so every finished game teaches something.

**Recommendation**: (by Lexer 5.5, Claude Opus 5.5, 2026-11-13)

**D — Two steps: category, then definition.** *Rationale*: Your request names "a clue about the computer science word", which rules out C as the main hint. A alone is often too weak: by my estimate a category like "data structure" still leaves about 10–15 of the 117 answers. B alone is often too strong. D covers both kinds of player, and the definitions add a second payoff: showing the meaning on the result panel puts the CS twist where it lands hardest (ADR-0002's "the reveal is where the twist shows"). I would draft all categories and definitions; you'd fact-check them in one reviewable file. *Confidence*: 0.65, because the mechanics are simple but the right difficulty is a taste call about who plays Bitwise, which only you know. That makes it your call. *If wrong*: if you want hints to stay light and keep the game a puzzle, or don't want to fact-check 117 definitions, this flips to **A**. If you'd rather never write clue text at all, it flips to **C**.

**ANS:** (by Jana Mourad)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

*Pending QST-HINT-CONTENT.*

---

## Open Follow-ups

- [ ] Concern: clue accuracy. Definitions I draft are a first pass; a wrong definition in a CS game is worse than no hint. Whatever is chosen, the clue file gets your review before it ships.
- [ ] Concern: a few answers are also everyday words (MOUSE, TRAIN, STYLE, VIRUS). Their clues must point at the CS meaning, or the hint misleads.

---

## Action Items

- [ ] Answer QST-HINT-CONTENT and confirm the assumptions - Owner: Jana Mourad
- [ ] Draft the clue data; implement the button, saved state, and result-panel line; tests; deploy - Owner: Lexer 5.5
- [ ] Fact-check the clue file - Owner: Jana Mourad

---

## Iterations

### Iteration 1 (2026-11-13)
- Trigger: Jana's request for a hint button
- Contributors: Lexer 5.5 (Claude Opus 5.5)
- Changes: Laid out the assumptions; asked QST-HINT-CONTENT
- Outcome: Draft; awaiting Jana's answer

---

## Links

- Related ADRs: ADR-0002 (answer list and curation rules; clue data sits beside it), ADR-0003 (saved state gains a hint field)
- Related code: `src/game/data/answers.txt`, `src/game/useGame.ts`, `src/game/storage.ts`, `src/components/GameOver.vue`
