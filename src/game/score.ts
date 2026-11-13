import type { LetterState, ScoredGuess } from './types'

/**
 * Score a guess against the answer, letter by letter (ADR-0002, "Scoring").
 *
 * Two passes, because answers like QUEUE and ARRAY repeat letters:
 *  1. Exact matches are `correct`, and each one uses up that copy of the letter.
 *  2. Left to right, a remaining letter is `present` only while the answer still
 *     has an unmatched copy of it; otherwise it is `absent`.
 * A one-pass "is the letter anywhere in the answer?" check over-reports yellows.
 */
export function scoreGuess(guess: string, answer: string): LetterState[] {
  const g = guess.toUpperCase()
  const a = answer.toUpperCase()
  if (g.length !== a.length) {
    throw new Error(`guess "${guess}" and answer "${answer}" differ in length`)
  }

  const states: LetterState[] = new Array<LetterState>(g.length).fill('absent')
  const unmatched = new Map<string, number>()

  for (let i = 0; i < g.length; i++) {
    if (g.charAt(i) === a.charAt(i)) {
      states[i] = 'correct'
    } else {
      const letter = a.charAt(i)
      unmatched.set(letter, (unmatched.get(letter) ?? 0) + 1)
    }
  }

  for (let i = 0; i < g.length; i++) {
    if (states[i] === 'correct') continue
    const letter = g.charAt(i)
    const left = unmatched.get(letter) ?? 0
    if (left > 0) {
      states[i] = 'present'
      unmatched.set(letter, left - 1)
    }
  }

  return states
}

const RANK: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 }

/**
 * The best state seen for each letter across all guesses, for coloring the
 * on-screen keyboard. A letter that was ever `present` must not be shown as
 * `absent` just because a later duplicate of it was.
 */
export function keyboardStates(guesses: ScoredGuess[]): Record<string, LetterState> {
  const best: Record<string, LetterState> = {}
  for (const { word, states } of guesses) {
    states.forEach((state, i) => {
      const letter = word.charAt(i)
      const seen = best[letter]
      if (seen === undefined || RANK[state] > RANK[seen]) best[letter] = state
    })
  }
  return best
}
