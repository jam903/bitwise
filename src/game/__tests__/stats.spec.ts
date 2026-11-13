import { describe, expect, it } from 'vitest'
import { emptyStats, recordResult } from '../stats'

describe('recordResult', () => {
  it('builds a streak over consecutive wins and keeps the best one after a loss', () => {
    let s = emptyStats()
    s = recordResult(s, true, 3)
    s = recordResult(s, true, 4)
    s = recordResult(s, false, 6)

    expect(s).toMatchObject({ played: 3, wins: 2, currentStreak: 0, maxStreak: 2 })
    expect(s.distribution).toEqual([0, 0, 1, 1, 0, 0])
  })

  it('does not add a loss to the guess distribution', () => {
    const s = recordResult(emptyStats(), false, 6)
    expect(s.distribution).toEqual([0, 0, 0, 0, 0, 0])
  })
})
