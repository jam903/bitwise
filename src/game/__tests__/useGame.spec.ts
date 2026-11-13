import { beforeEach, describe, expect, it } from 'vitest'
import { useGame } from '../useGame'
import { ANSWERS } from '../words'

// random() = 0 always picks the first answer in the list.
const FIRST = ANSWERS[0] as string

function type(game: ReturnType<typeof useGame>, word: string) {
  for (const letter of word) game.press(letter)
  game.press('Enter')
}

// Valid English guesses that share no ambiguity with the test answer.
const MISSES = ['CRANE', 'BLIMP', 'FUDGE', 'NIGHT', 'WOUND', 'PSYCH'].filter((w) => w !== FIRST)

beforeEach(() => {
  localStorage.clear()
})

describe('playing a game', () => {
  it('wins when the player types the answer, and records the win', () => {
    const game = useGame({ random: () => 0 })
    type(game, 'CRANE')
    type(game, FIRST)

    expect(game.status.value).toBe('won')
    expect(game.stats.value).toMatchObject({ played: 1, wins: 1, currentStreak: 1 })
    expect(game.stats.value.distribution[1]).toBe(1) // won in 2 guesses
  })

  it('loses after six wrong guesses and ignores further typing', () => {
    const game = useGame({ random: () => 0 })
    for (const w of MISSES.slice(0, 6)) type(game, w)

    expect(game.status.value).toBe('lost')
    expect(game.stats.value).toMatchObject({ played: 1, wins: 0, currentStreak: 0 })
    game.press('A')
    expect(game.current.value).toBe('')
  })

  it('rejects a word that is not in the list without using up a guess', () => {
    const game = useGame({ random: () => 0 })
    type(game, 'XQZZV')

    expect(game.message.value).toBe('Not in word list')
    expect(game.scored.value).toHaveLength(0)
    expect(game.current.value).toBe('XQZZV') // left in place so the player can fix it
  })

  it('rejects a guess shorter than five letters', () => {
    const game = useGame({ random: () => 0 })
    type(game, 'CAT')
    expect(game.message.value).toBe('Not enough letters')
    expect(game.scored.value).toHaveLength(0)
  })

  it('stops accepting letters once the row is full', () => {
    const game = useGame({ random: () => 0 })
    for (const letter of 'CRANES') game.press(letter)
    expect(game.current.value).toBe('CRANE')
  })

  it('starts a different word on "play again" and keeps the stats', () => {
    const game = useGame({ random: () => 0 })
    type(game, FIRST)
    game.newGame()

    expect(game.answer.value).not.toBe(FIRST)
    expect(game.status.value).toBe('playing')
    expect(game.stats.value.wins).toBe(1)
  })
})

describe('hints (ADR-0004)', () => {
  it('reveals the category first, then the definition, then nothing more', () => {
    const game = useGame({ random: () => 0 })
    expect(game.hintsUsed.value).toBe(0)
    expect(game.clue.value?.category).toBeTruthy()

    game.useHint()
    expect(game.hintsUsed.value).toBe(1)
    game.useHint()
    expect(game.hintsUsed.value).toBe(2)
    game.useHint()
    expect(game.hintsUsed.value).toBe(2)
  })

  it('keeps used hints after a reload, so reloading never gives a free hint back', () => {
    const before = useGame({ random: () => 0 })
    before.useHint()

    const after = useGame({ random: () => 0 })
    expect(after.hintsUsed.value).toBe(1)
  })

  it('offers fresh hints on "play again"', () => {
    const game = useGame({ random: () => 0 })
    game.useHint()
    type(game, FIRST)
    game.newGame()
    expect(game.hintsUsed.value).toBe(0)
  })

  it('does not spend a hint once the game is over', () => {
    const game = useGame({ random: () => 0 })
    type(game, FIRST)
    game.useHint()
    expect(game.hintsUsed.value).toBe(0)
  })

  it('does not change win/loss stats when a hint was used', () => {
    const game = useGame({ random: () => 0 })
    game.useHint()
    type(game, FIRST)
    expect(game.stats.value).toMatchObject({ played: 1, wins: 1, currentStreak: 1 })
  })
})

describe('saved state (ADR-0003)', () => {
  it('still loads a game saved before hints existed (no "hints" field)', () => {
    // Players who were mid-game when ADR-0004 shipped have the old save format.
    localStorage.setItem('cs-word-game:game:v1', JSON.stringify({ answer: FIRST, guesses: ['CRANE'] }))

    const game = useGame({ random: () => 0.5 })
    expect(game.answer.value).toBe(FIRST)
    expect(game.scored.value.map((g) => g.word)).toEqual(['CRANE'])
    expect(game.hintsUsed.value).toBe(0)
  })

  it('rejects a saved hint count outside 0–2 and starts fresh', () => {
    localStorage.setItem('cs-word-game:game:v1', JSON.stringify({ answer: FIRST, guesses: ['CRANE'], hints: 7 }))
    const game = useGame({ random: () => 0 })
    expect(game.scored.value).toHaveLength(0)
  })

  it('restores an in-progress game after a reload', () => {
    const before = useGame({ random: () => 0 })
    type(before, 'CRANE')

    const after = useGame({ random: () => 0.5 }) // a reload must not pick a new word
    expect(after.answer.value).toBe(FIRST)
    expect(after.scored.value.map((g) => g.word)).toEqual(['CRANE'])
  })

  it('does not count a finished game twice when the page is reloaded', () => {
    const before = useGame({ random: () => 0 })
    type(before, FIRST)

    const after = useGame({ random: () => 0 })
    expect(after.status.value).toBe('won')
    expect(after.stats.value.played).toBe(1)
  })

  it('starts a fresh game instead of crashing when saved data is corrupted', () => {
    localStorage.setItem('cs-word-game:game:v1', '{"answer": 42, "guesses": "oops"')
    localStorage.setItem('cs-word-game:stats:v1', '{"played": -1}')

    const game = useGame({ random: () => 0 })
    expect(game.answer.value).toBe(FIRST)
    expect(game.scored.value).toHaveLength(0)
    expect(game.stats.value.played).toBe(0)
  })
})
