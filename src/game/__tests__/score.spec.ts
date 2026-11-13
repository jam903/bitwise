import { describe, expect, it } from 'vitest'
import { keyboardStates, scoreGuess } from '../score'

describe('scoreGuess', () => {
  it('marks every letter correct when the guess is the answer', () => {
    expect(scoreGuess('STACK', 'STACK')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct'])
  })

  it('marks letters in the word but in the wrong place as present', () => {
    // CACHE: TRACE shares A and C (wrong places) and E (right place)
    expect(scoreGuess('TRACE', 'CACHE')).toEqual(['absent', 'absent', 'present', 'present', 'correct'])
  })

  it('treats a lowercase guess the same as uppercase', () => {
    // Physical keyboards produce lowercase keys; scoring must not depend on case.
    expect(scoreGuess('trace', 'CACHE')).toEqual(scoreGuess('TRACE', 'CACHE'))
  })

  // Repeated letters: the bug class ADR-0002 predicted, because the brief's own
  // examples (QUEUE, ARRAY) repeat letters. A one-pass "is the letter anywhere
  // in the answer?" check gets every case below wrong.
  describe('repeated letters', () => {
    it('gives only as many yellows as the answer has unmatched copies (QUEUE / EERIE)', () => {
      // QUEUE has two E's; the last one is matched green, leaving one E for a yellow.
      // The naive check would also mark the second E present.
      expect(scoreGuess('EERIE', 'QUEUE')).toEqual(['present', 'absent', 'absent', 'absent', 'correct'])
    })

    it('lets a later green claim the only copy before an earlier yellow can (TOKEN / EMBED)', () => {
      // TOKEN has one E, matched exactly at position 4; the first E gets nothing.
      expect(scoreGuess('EMBED', 'TOKEN')).toEqual(['absent', 'absent', 'absent', 'correct', 'absent'])
    })

    it('marks extra copies absent once the answer runs out (STACK / SASSY)', () => {
      expect(scoreGuess('SASSY', 'STACK')).toEqual(['correct', 'present', 'absent', 'absent', 'absent'])
    })

    it('counts each repeated answer letter separately (ARRAY / RADAR)', () => {
      // ARRAY has two R's, so both R's in RADAR can be yellow.
      expect(scoreGuess('RADAR', 'ARRAY')).toEqual(['present', 'present', 'absent', 'correct', 'present'])
    })
  })
})

describe('keyboardStates', () => {
  it('keeps a letter yellow when a duplicate of it in the same guess was gray', () => {
    // EERIE vs QUEUE: E is present at position 1 and absent at position 2.
    // Showing E as gray on the keyboard would tell the player E isn't in the word.
    const keys = keyboardStates([{ word: 'EERIE', states: scoreGuess('EERIE', 'QUEUE') }])
    expect(keys.E).toBe('correct') // the last E is green, the best state wins
    expect(keys.R).toBe('absent')
  })

  it('upgrades a letter from yellow to green and never downgrades it', () => {
    const keys = keyboardStates([
      { word: 'TRACE', states: scoreGuess('TRACE', 'CACHE') }, // C present
      { word: 'CATCH', states: scoreGuess('CATCH', 'CACHE') }, // C correct
      { word: 'TRACE', states: scoreGuess('TRACE', 'CACHE') }, // C present again
    ])
    expect(keys.C).toBe('correct')
  })
})
