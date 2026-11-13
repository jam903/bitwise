<!-- adr template version: "adr 3.12.0" -->

# Word lists and guess validation

- **Date**: 2026-11-13
- **Iteration**: 4
- **Status**: Implemented
- **Deciders**: Jana Mourad (decided), Lexer 5.5 (recommended; made the implementation choices listed under Provenance)

**TL;DR**: Answers are 117 hand-curated five-letter CS terms. Any five-letter English word from the ENABLE list, plus every answer, is accepted as a guess. Six guesses; repeated letters are scored in two passes.

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
- Status: answered
- Why asking: Answers are always CS words, but a player also *types* guesses, and the game must decide which typed words are allowed. This choice changes how the game feels, how much data the site ships, and where the word list comes from. For scale: a good five-letter CS answer list is probably 100–250 words (my rough estimate; we'll know once we curate it), while English has roughly 13,000 five-letter words.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — CS words only**: a guess must be on the CS answer list. Tiny download, no outside data. Every guess teaches CS vocabulary, which makes it closer to a quiz. But normal words like CRANE get rejected, which feels like a bug to anyone who's played this kind of game. And since the answer must be one of the ~200 accepted words, a player can narrow it down quickly.
- **B — CS answers, any English guess**: bundle a list of ~13k five-letter English words (from a permissively licensed source such as the public-domain ENABLE list) plus the CS list. Plays like the familiar game: any real word works as an opening guess. Costs tens of kilobytes compressed, and the guess list needs filtering (offensive words, licensing check).
- **C — Any five letters**: no dictionary at all; any string like XQZZV is accepted. Simplest to build, but players can type made-up strings that test five new letters at once, which makes the puzzle much easier and less of a word game.

**Recommendation**: (by Lexer 5.5, Claude Opus 5.5, 2026-11-13)

**B — CS answers, any English guess.** *Rationale*: A small answer list means a CS-only guess list (A) gives away the search space: the only valid guesses are the possible answers. Free-form guessing (C) removes the word-game skill. B keeps the familiar strategy (open with a common word, then narrow it down) and puts the CS twist where it shows: the reveal. The cost is a static data file the browser caches once; GitHub Pages serves it compressed. *Confidence*: 0.75, because that's the convention in this genre and the size estimate is arithmetic (13k × 6 bytes ≈ 78 KB before compression), not a measured build. The deciding factor is what you want the game *for*, which only you know. *If wrong*: if the point is for players to *practice CS vocabulary* with every guess (a study tool more than a puzzle), then A's "every guess is a CS word" becomes the feature, and this flips to **A**.

**ANS:** (by Jana Mourad)
B — CS answers, any English guess, as recommended. I also approve the assumptions (five letters, six guesses; curation rules: no acronyms, no S-plurals, no proper nouns). (Given in chat 2026-11-13; recorded by Lexer 5.5.)

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

### Context
The game needs two word lists, and it must decide which typed guesses count.

### Chosen: CS answers, any English five-letter guess

- **Answers**: a hand-curated list of five-letter CS terms (no acronyms, no S-plurals, no proper nouns).
- **Allowed guesses**: five-letter words from the public-domain ENABLE word list, plus every answer (some CS terms such as MUTEX aren't in an English dictionary, and an answer must always be typeable).
- **Board**: five letters, six guesses.
- **Scoring**: two passes (exact matches first, then "wrong place" only while unmatched copies remain), as in the COD block.

**Rationale**: Jana accepted the recommendation (QST-GUESS-VALIDATION → B) and both assumptions on 2026-11-13. The only reasoning on record is Lexer 5.5's, in the Recommendation above. [Missing: Jana's own reasons. She approved "as recommended" without stating any.]

**Trade-offs accepted**: tens of kilobytes of guess-list data (named in option B, which Jana chose).

**Not ruled on** (this line used to be listed as an accepted trade-off, which overstated it): the guess list isn't filtered for offensive words. Option B's own description said the list "needs filtering (offensive words, licensing check)". The licensing half was done (ENABLE is public domain); the filtering half was not. Lexer 5.5 mentioned the unfiltered list to Jana in chat as an open item. [Missing: Jana's ruling.] As shipped, an offensive word can be typed as a guess but can never be an answer.

### Rejected alternatives

*Reasons below come from this record (option descriptions, the Recommendation, the assumptions). None were stated by Jana.*

- **A — CS words only** (QST-GUESS-VALIDATION). Not chosen. Recommendation: with a small answer list, the guess list *is* the answer list, which "gives away the search space". Option text: ordinary words like CRANE get rejected, "which feels like a bug."
- **C — Any five letters** (QST-GUESS-VALIDATION). Not chosen. Recommendation: free-form guessing "removes the word-game skill." Option text: made-up strings can test five new letters at once.
- **Variable word length** (Explicitation assumption). Deferred, not rejected: "I'd hold it for a later version." Recorded cost: it changes the board layout and makes the answer list harder to balance. [Missing: any trigger for revisiting it.]

### Reopen if

*The only recorded condition is the Recommendation's* If wrong *line. Jana stated no reopening conditions of her own.*

- **Switch to A (CS words only)** if the game's purpose becomes practicing CS vocabulary with every guess, "a study tool more than a puzzle."
- [Missing: no reopening condition was recorded for five letters / six guesses, the curation rules, or the choice of ENABLE.]

### Provenance

- **Ruled by Jana** (chat, 2026-11-13): option B; five letters and six guesses; the curation rules (no acronyms, no S-plurals, no proper nouns).
- **Chosen by Lexer 5.5 during implementation, not ruled on by Jana:**
  - ENABLE as the specific source. Option B named it only as an example ("such as").
  - Merging the answers into the allowed guesses, which was needed because MUTEX, TUPLE, LEXER, DEQUE, and QUBIT aren't in ENABLE (iteration 3).
  - Shipping the guess list unfiltered (see "Not ruled on" above).
  - The 117 specific answer words. [Missing: Jana's review; see Action Items.]

### Consequences
- The answer list is a reviewable data file; Jana can strike or add words.
- Unit tests guard both lists (length, uniqueness, every answer typeable) and the repeated-letter scoring.

---

## Open Follow-ups

- [x] Future task: draft the CS answer list as a reviewable file (one word per line) so Jana can strike or add words before it ships. *Done in iteration 3 (`src/game/data/answers.txt`); the format became `WORD | category | definition` under ADR-0004. The list shipped before Jana's review, which is still pending (Action Items).*
- [ ] Concern: the answer list ships inside the site's code, so anyone can read it in browser devtools (see ADR-0003)

---

## Action Items

- [x] Answer QST-GUESS-VALIDATION and confirm the two assumptions - Owner: Jana Mourad
- [x] Draft the answer list; source and license-check the guess list if B - Owner: Lexer 5.5
- [ ] Review `src/game/data/answers.txt` (117 words): strike or add - Owner: Jana Mourad

---

## Iterations

### Iteration 1 (2026-11-13)
- Trigger: Initial draft from Jana's project brief
- Contributors: Lexer 5.5 (Claude Opus 5.5)
- Changes: Separated the answer list from the guess list; asked QST-GUESS-VALIDATION; recorded the repeated-letter scoring rule
- Outcome: Draft; awaiting Jana's answer

### Iteration 2 (2026-11-13)
- Trigger: Jana's answer in chat (approved all recommendations and assumptions)
- Contributors: Jana Mourad, Lexer 5.5 (Claude Opus 5.5)
- Changes: Recorded the answer (B — CS answers, any English guess); named ENABLE as the guess-list source; filled the Decision
- Outcome: `Draft → Accepted`

### Iteration 3 (2026-11-13)
- Trigger: Implementation
- Contributors: Lexer 5.5 (Claude Opus 5.5)
- Changes:
  - `src/game/data/answers.txt`: 117 curated CS terms, with the curation rules in its header comment.
  - `src/game/data/guesses.txt`: 8,636 five-letter ENABLE words, built by `scripts/ephemeral/2026-11-13-build-guess-list.sh`.
  - The predicted gap was real: MUTEX, TUPLE, LEXER, DEQUE, QUBIT are missing from ENABLE, so `words.ts` merges answers into the allowed set (guarded by a test).
  - Scoring is in `src/game/score.ts`; tests cover the four repeated-letter cases (QUEUE/EERIE, TOKEN/EMBED, STACK/SASSY, ARRAY/RADAR), plus a keyboard rule: a letter once yellow or green is never shown gray.
  - The whole bundle, both lists included, is 53 KB gzipped.
- Outcome: `Accepted → Implemented`

### Iteration 4 (2026-11-13)
- Trigger: Jana's cold-resumption test, which found documentation gaps (rejected alternatives, reopening conditions, outdated TL;DRs, iteration numbering)
- Contributors: Lexer 5.5 (Claude Opus 5.5), drawing only on what this record and the chat already contain
- Changes:
  - Rewrote the TL;DR (the iteration-1 draft still said "Still open: which guesses the game accepts").
  - Added **Rejected alternatives**, **Reopen if**, and **Provenance** to the Decision, marking missing information `[Missing: …]`.
  - Corrected an attribution: the unfiltered guess list was listed under "Trade-offs accepted" although Jana never ruled on it. It's now under "Not ruled on".
  - Checked off the answer-list follow-up (done in iteration 3), noting that Jana's review is still pending. Added the ADR-0004 link.
- Outcome: no status change (still Implemented). No decision changed.

---

## Links

- Related ADRs: ADR-0001 (toolchain; the gate runs the scoring tests), ADR-0003 (game mode draws from this answer list), ADR-0004 (each answer now carries its hint clues in the same file)
- Related code: `src/game/data/answers.txt`, `src/game/data/guesses.txt`, `src/game/words.ts`, `src/game/score.ts`, `scripts/ephemeral/2026-11-13-build-guess-list.sh`
