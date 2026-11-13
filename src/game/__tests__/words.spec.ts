import { describe, expect, it } from 'vitest'
import { ANSWERS, isAllowedGuess, parseWordList, pickAnswer } from '../words'

describe('answer list (src/game/data/answers.txt)', () => {
  it('has only five-letter A–Z words, so every answer fits the board', () => {
    const bad = ANSWERS.filter((w) => !/^[A-Z]{5}$/.test(w))
    expect(bad).toEqual([])
  })

  it('has no duplicates (a duplicate would make that word twice as likely)', () => {
    const dupes = ANSWERS.filter((w, i) => ANSWERS.indexOf(w) !== i)
    expect(dupes).toEqual([])
  })

  it('has every answer accepted as a guess, even CS terms missing from English dictionaries', () => {
    // MUTEX, TUPLE, LEXER, DEQUE, QUBIT are not in ENABLE; without the merge in
    // words.ts the player could never type the answer.
    const untypeable = ANSWERS.filter((w) => !isAllowedGuess(w))
    expect(untypeable).toEqual([])
    expect(isAllowedGuess('MUTEX')).toBe(true)
  })
})

describe('isAllowedGuess', () => {
  it('accepts ordinary English words as guesses (ADR-0002, option B)', () => {
    expect(isAllowedGuess('CRANE')).toBe(true)
    expect(isAllowedGuess('crane')).toBe(true)
  })

  it('rejects strings that are not words', () => {
    expect(isAllowedGuess('XQZZV')).toBe(false)
  })
})

describe('parseWordList', () => {
  it('ignores comment lines and blank lines in the data files', () => {
    expect(parseWordList('# header\n\nstack\n  QUEUE  \n')).toEqual(['STACK', 'QUEUE'])
  })
})

describe('pickAnswer', () => {
  it('does not repeat the previous answer on "play again"', () => {
    const first = pickAnswer(() => 0)
    expect(pickAnswer(() => 0, first)).not.toBe(first)
  })

  it('stays in range even when the random source returns its maximum', () => {
    expect(ANSWERS).toContain(pickAnswer(() => 0.9999999999))
  })
})
