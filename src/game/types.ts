// Shared game types (ADR-0001: TypeScript, so the three letter states are a
// closed type that scoring, board, and keyboard all agree on).

export const WORD_LENGTH = 5
export const MAX_GUESSES = 6

/** Feedback for one letter: right place, wrong place, or not in the word. */
export type LetterState = 'correct' | 'present' | 'absent'

export interface ScoredGuess {
  word: string
  states: LetterState[]
}

export type GameStatus = 'playing' | 'won' | 'lost'

/** Hints come in two steps (ADR-0004): 1 = category shown, 2 = definition too. */
export const MAX_HINTS = 2

/** What survives a reload (ADR-0003). Letter states are recomputed, not stored. */
export interface SavedGame {
  answer: string
  guesses: string[]
  /**
   * Hint steps used, 0 to MAX_HINTS. Optional because games saved before
   * ADR-0004 shipped have no such field; they load as 0.
   */
  hints?: number
}

export interface Stats {
  played: number
  wins: number
  currentStreak: number
  maxStreak: number
  /** distribution[i] = games won in i + 1 guesses */
  distribution: number[]
}
