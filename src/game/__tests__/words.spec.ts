import { describe, expect, it } from 'vitest'
import {
  ANSWER_ENTRIES,
  ANSWERS,
  clueFor,
  isAllowedGuess,
  parseAnswerFile,
  parseWordList,
  pickAnswer,
} from '../words'

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

describe('hint clues (ADR-0004)', () => {
  it('gives every answer both a category and a definition', () => {
    // A missing clue would make the hint button reveal nothing for that word.
    const missing = ANSWER_ENTRIES.filter((e) => e.category === '' || e.definition === '')
    expect(missing.map((e) => e.word)).toEqual([])
  })

  it('never spells out the answer inside its own clues', () => {
    // e.g. a QUEUE definition saying "a queue is…" would hand the word over.
    const leaky = ANSWER_ENTRIES.filter((e) =>
      `${e.category} ${e.definition}`.toUpperCase().includes(e.word),
    )
    expect(leaky.map((e) => e.word)).toEqual([])
  })

  it('never uses a category for just one word, which would give that answer away', () => {
    const counts = new Map<string, number>()
    for (const { category } of ANSWER_ENTRIES) counts.set(category, (counts.get(category) ?? 0) + 1)
    const singletons = [...counts].filter(([, n]) => n < 2).map(([c]) => c)
    expect(singletons).toEqual([])
  })

  it('looks clues up by answer, whatever the case', () => {
    expect(clueFor('mutex')?.category).toBe('concurrency')
    expect(clueFor('CRANE')).toBeUndefined() // a guess word, not an answer
  })
})

describe('parseAnswerFile', () => {
  it('reads WORD | category | definition lines and skips comments', () => {
    expect(parseAnswerFile('# header\nstack | data structures | Last in, first out.\n')).toEqual([
      { word: 'STACK', category: 'data structures', definition: 'Last in, first out.' },
    ])
  })

  it('leaves clue fields empty on a malformed line so the clue tests catch it', () => {
    expect(parseAnswerFile('QUEUE')).toEqual([{ word: 'QUEUE', category: '', definition: '' }])
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
