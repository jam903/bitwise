// Word lists (ADR-0002): CS answers; any English five-letter word as a guess.
import answersRaw from './data/answers.txt?raw'
import guessesRaw from './data/guesses.txt?raw'

/** One word per line; blank lines and `#` comments ignored; uppercased. */
export function parseWordList(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'))
    .map((line) => line.toUpperCase())
}

export const ANSWERS: readonly string[] = parseWordList(answersRaw)

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
