import { MAX_GUESSES, type Stats } from './types'

export function emptyStats(): Stats {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: new Array<number>(MAX_GUESSES).fill(0),
  }
}

/** Fold one finished game into the stats. Returns a new object. */
export function recordResult(stats: Stats, won: boolean, guessCount: number): Stats {
  const distribution = [...stats.distribution]
  if (won) distribution[guessCount - 1] = (distribution[guessCount - 1] ?? 0) + 1
  const currentStreak = won ? stats.currentStreak + 1 : 0
  return {
    played: stats.played + 1,
    wins: stats.wins + (won ? 1 : 0),
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    distribution,
  }
}
