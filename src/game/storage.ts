// Saved state in localStorage (ADR-0003). Storage can be missing, blocked
// (private mode), full, or hold junk from an older version, so every access is
// guarded and every read is validated: the game must still play if it fails.
import { emptyStats } from './stats'
import { MAX_GUESSES, WORD_LENGTH, type SavedGame, type Stats } from './types'

const GAME_KEY = 'cs-word-game:game:v1'
const STATS_KEY = 'cs-word-game:stats:v1'

const WORD = new RegExp(`^[A-Z]{${WORD_LENGTH}}$`)

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable or full: keep playing, just don't remember.
  }
}

function isSavedGame(x: unknown): x is SavedGame {
  if (typeof x !== 'object' || x === null) return false
  const { answer, guesses } = x as Record<string, unknown>
  return (
    typeof answer === 'string' &&
    WORD.test(answer) &&
    Array.isArray(guesses) &&
    guesses.length <= MAX_GUESSES &&
    guesses.every((g) => typeof g === 'string' && WORD.test(g))
  )
}

function isStats(x: unknown): x is Stats {
  if (typeof x !== 'object' || x === null) return false
  const s = x as Record<string, unknown>
  const counts = [s.played, s.wins, s.currentStreak, s.maxStreak]
  return (
    counts.every((n) => Number.isInteger(n) && (n as number) >= 0) &&
    Array.isArray(s.distribution) &&
    s.distribution.length === MAX_GUESSES &&
    s.distribution.every((n) => Number.isInteger(n) && n >= 0)
  )
}

export function loadGame(): SavedGame | null {
  const x = read(GAME_KEY)
  return isSavedGame(x) ? x : null
}

export function saveGame(game: SavedGame): void {
  write(GAME_KEY, game)
}

export function loadStats(): Stats {
  const x = read(STATS_KEY)
  return isStats(x) ? x : emptyStats()
}

export function saveStats(stats: Stats): void {
  write(STATS_KEY, stats)
}
