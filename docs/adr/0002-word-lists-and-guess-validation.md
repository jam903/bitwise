<!-- adr template version: "adr 3.12.0" -->

# Word lists and guess validation

- **Date**: 2026-11-13
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jana Mourad, Lexer 5.5

**TL;DR**: Answers come from a hand-curated list of five-letter CS words. Still open: which guesses the game accepts, which decides whether we bundle an English dictionary.

---

## Originating Context

**Source**: Human dump (Jana Mourad, 2026-11-13). The relevant part: *"the answers are computer science words (ARRAY, STACK, QUEUE, CACHE, TOKEN…)"*. Full text in ADR-0001.

**Agency Grant**: Explore options and recommend; no code until the questions are answered.

---

## Explicitation

**What I understand**:

1. **There are two word lists, not one.** The *answer list* (words the game can pick) and the *allowed-guess list* (words a player may type) are separate in every game of this kind. The CS twist is about the answer list. Whether it also limits the guess list is the open question below.
2. **The answer list is curated by hand.** It's the product's content, and its quality decides whether the game is fun.
3. **Repeated letters must be scored right.** This isn't a decision, but your own examples hit it: QUEUE has two U's and two E's, and ARRAY has two A's and two R's. The standard rule: mark exact matches first, then mark a letter "wrong place" only while that letter still has unmatched copies in the answer. A naive "is the letter anywhere in the word?" check gets these wrong. That's the first regression test we'll write (see COD below).

**Assumptions** (please confirm or override; I didn't make these separate questions):

- **Five letters, six guesses**, matching every example you gave. The cost: many good CS words have other lengths (LAMBDA, KERNEL, SOCKET, THREAD, POINTER). Variable length is possible but changes the board layout and makes the answer list harder to balance. I'd hold it for a later version.
- **Curation rules for answers**: real CS terms a second-year student would recognize. No acronyms (ASCII, REGEX?), no plurals made by adding S (BYTES), no proper nouns (LINUX). Each of these is a judgment call; the list itself will show where the line falls.

**Confirm**: Jana Mourad: the two assumptions, plus the question below.

---

## Questions

### QST-GUESS-VALIDATION: Which guesses should the game accept?
- Status: unanswered
- Why asking: Answers are always CS words, but a player also *types* guesses, and the game must decide which typed words are allowed. This choice changes how the game feels, how much data the site ships, and where the word list comes from. For scale: a good five-letter CS answer list is probably 100–250 words (my rough estimate; we'll know once we curate it), while English has roughly 13,000 five-letter words.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — CS words only**: a guess must be on the CS answer list. Tiny download, no outside data. Every guess teaches CS vocabulary, which makes it closer to a quiz. But normal words like CRANE get rejected, which feels like a bug to anyone who's played this kind of game. And since the answer must be one of the ~200 accepted words, a player can narrow it down quickly.
- **B — CS answers, any English guess**: bundle a list of ~13k five-letter English words (from a permissively licensed source such as the public-domain ENABLE list) plus the CS list. Plays like the familiar game: any real word works as an opening guess. Costs tens of kilobytes compressed, and the guess list needs filtering (offensive words, licensing check).
- **C — Any five letters**: no dictionary at all; any string like XQZZV is accepted. Simplest to build, but players can type made-up strings that test five new letters at once, which makes the puzzle much easier and less of a word game.

**Recommendation**: (by Lexer 5.5, Claude Opus 5.5, 2026-11-13)

**B — CS answers, any English guess.** *Rationale*: A small answer list means a CS-only guess list (A) gives away the search space: the only valid guesses are the possible answers. Free-form guessing (C) removes the word-game skill. B keeps the familiar strategy (open with a common word, then narrow it down) and puts the CS twist where it shows: the reveal. The cost is a static data file the browser caches once; GitHub Pages serves it compressed. *Confidence*: 0.75, because that's the convention in this genre and the size estimate is arithmetic (13k × 6 bytes ≈ 78 KB before compression), not a measured build. The deciding factor is what you want the game *for*, which only you know. *If wrong*: if the point is for players to *practice CS vocabulary* with every guess (a study tool more than a puzzle), then A's "every guess is a CS word" becomes the feature, and this flips to **A**.

**ANS:** (by Jana Mourad)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Supporting Materials

### COD: repeated-letter-scoring
```text
answer: Q U E U E
guess:  E E R I E

pass 1 (exact matches):  position 5  E = E → correct
         unmatched answer letters left: Q, U, E, U   → one E remains
pass 2 (left to right):  position 1  E → present  (uses the one remaining E)
                         position 2  E → absent   (no E left)
                         position 3  R → absent
                         position 4  I → absent

correct result: present, absent, absent, absent, correct
naive "is E anywhere in the answer?" result: present, PRESENT, absent, absent, correct  ← bug
```

---

## Decision

*Pending QST-GUESS-VALIDATION.*

---

## Open Follow-ups

- [ ] Future task: draft the CS answer list as a reviewable file (one word per line) so Jana can strike or add words before it ships
- [ ] Concern: the answer list ships inside the site's code, so anyone can read it in browser devtools (see ADR-0003)

---

## Action Items

- [ ] Answer QST-GUESS-VALIDATION and confirm the two assumptions - Owner: Jana Mourad
- [ ] Draft the answer list; source and license-check the guess list if B - Owner: Lexer 5.5

---

## Iterations

### Iteration 1 (2026-11-13)
- Trigger: Initial draft from Jana's project brief
- Contributors: Lexer 5.5 (Claude Opus 5.5)
- Changes: Separated the answer list from the guess list; asked QST-GUESS-VALIDATION; recorded the repeated-letter scoring rule
- Outcome: Draft; awaiting Jana's answer

---

## Links

- Related ADRs: ADR-0001 (toolchain; the gate will run the scoring tests), ADR-0003 (game mode draws from this answer list)
