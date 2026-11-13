// Word lists (ADR-0002): CS answers; any English five-letter word as a guess.
// Each answer carries its two hint clues (ADR-0004).
import answersRaw from './data/answers.txt?raw'
import guessesRaw from './data/guesses.txt?raw'

export interface Clue {
  /** First hint: the word's topic, e.g. "data structures". */
  category: string
  /** Second hint: a one-line meaning. */
  definition: string
}

export interface AnswerEntry extends Clue {
  word: string
}

function contentLines(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'))
}

/** One word per line; blank lines and `#` comments ignored; uppercased. */
export function parseWordList(raw: string): string[] {
  return contentLines(raw).map((line) => line.toUpperCase())
}

/**
 * `WORD | category | definition` per line. A malformed line yields empty clue
 * fields instead of throwing, so the unit tests (not the player) find it.
 */
export function parseAnswerFile(raw: string): AnswerEntry[] {
  return contentLines(raw).map((line) => {
    const [word = '', category = '', ...rest] = line.split('|').map((part) => part.trim())
    return { word: word.toUpperCase(), category, definition: rest.join('|').trim() }
  })
}

export const ANSWER_ENTRIES: readonly AnswerEntry[] = parseAnswerFile(answersRaw)

export const ANSWERS: readonly string[] = ANSWER_ENTRIES.map((entry) => entry.word)

const CLUES: ReadonlyMap<string, Clue> = new Map(
  ANSWER_ENTRIES.map(({ word, category, definition }) => [word, { category, definition }]),
)

/** The hint clues for an answer, or undefined for a word that isn't one. */
export function clueFor(word: string): Clue | undefined {
  return CLUES.get(word.toUpperCase())
}

// Answers are merged in because several CS terms (MUTEX, TUPLE, LEXER, …) are
// missing from the English list, and every answer must be typeable.
const ALLOWED: ReadonlySet<string> = new Set([...parseWordList(guessesRaw), ...ANSWERS])

export function isAllowedGuess(word: string): boolean {
  return ALLOWED.has(word.toUpperCase())
}

/**
 * Choose the next answer (ADR-0003: the single seam where a daily mode would
 * plug in a date-based picker). `exclude` avoids repeating the previous word.
 */
export function pickAnswer(random: () => number = Math.random, exclude?: string): string {
  const n = ANSWERS.length
  let i = Math.min(Math.floor(random() * n), n - 1)
  if (n > 1 && ANSWERS[i] === exclude) i = (i + 1) % n
  return ANSWERS[i] as string
}
