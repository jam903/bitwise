# Green Tests, Gray Keyboard

**Date**: 2026-11-13
**Authors**: Lexer 5.5 (Claude Opus 5.5), with Jana Mourad
**Topic**: Thirty-two passing tests, and a keyboard that couldn't tell players which letters were dead

## The Discovery

The first playable build was done. All 32 unit tests passed, `vue-tsc` was clean, and the production build was 53 KB gzipped. Every gate this project has said "ship it."

Before committing, I took headless-Chrome screenshots of a seeded mid-game state: answer QUEUE, guesses CRANE, EERIE, QUOTE. The light theme looked right. The scoring rendered exactly as the tests promised: in EERIE, the first E was yellow, the second gray, the last green.

Then dark mode. On the on-screen keyboard, the letters already ruled out (A, R, T, I, O, C, N) were `#3b4554`, and the unused letters were `#2a3441`. Side by side at phone size, they were nearly the same color. A dark-mode player had lost the keyboard's whole job: showing which letters are dead.

No test could have caught this, and none should try. "The absent key is visibly darker than an unused key" is a perceptual property. jsdom has no eyes, and a test asserting two hex values differ would pass on exactly the colors that failed.

The fix took two lines in `src/assets/base.css`: unused keys lighter (`#4a5566`), dead keys darker (`#232a33`) with muted text. Re-shot, the dead letters now read as dead.

There was a second, smaller catch from the same screenshots. The first shots looked cut off on the right, which seemed like a layout bug at 390px. The board's left edge sat at 85px, which is just where a centered 330px board lands in a ~500px window: headless Chrome enforces a minimum window width and cropped the image. Shooting through a real 360px iframe showed the layout fit. Looking surfaced a real bug and a fake one, and only a second look told them apart.

## Why This Matters

Players never read test output; they read the screen. Every decision record for this game was about behavior: how letters are scored, which guesses are accepted, what survives a reload. The tests encode those faithfully. But "works" for a game also means "can be read at a glance on a phone at night," and no decision record asked that question, so no test answered it.

## Fifth Directive at Work (and Its Edge)

The Fifth Directive says run the gate before every commit, and the gate was run. It was green. The directive did its job and still wasn't enough: a green gate means the *tested* properties hold. It says nothing about the untested ones. What added the missing check was the Fourth Directive's question asked from the other side: not "would this test catch a real bug?" but "what real bug could no test here catch?"

## Lessons Learned

- **For UI, a screenshot of a realistic state is part of verification**, not polish. Seed a mid-game state (a few scored rows, a colored keyboard), not an empty board. The empty board looked fine in both themes.
- **Check both themes.** Every color token had a dark twin, and the bug lived only in the twin.
- **Don't encode perception as a fake assertion.** A test that two colors differ would have passed on the broken palette. Better to note the requirement where the tokens live (there's now a comment in `base.css`) than to write a contrived test.
- **Distrust the instrument once.** The cropped screenshot nearly sent me fixing a layout that wasn't broken.

## Metacognitive Insight

Tests are claims we chose to write down, so a green suite measures how well we listed our worries, not how complete they are. The cheap habit that widens the list is to *look at the thing as its user would*, in the conditions they'll actually use it, before calling it done.
