// The game as a Vue composable: reactive state plus the actions the UI calls.
// Pure rules live in score.ts / words.ts / stats.ts; this file wires them to
// state and storage.
import { computed, ref } from 'vue'
import { keyboardStates, scoreGuess } from './score'
import { recordResult } from './stats'
import { loadGame, loadStats, saveGame, saveStats } from './storage'
import { MAX_GUESSES, MAX_HINTS, WORD_LENGTH, type GameStatus, type ScoredGuess } from './types'
import { clueFor, isAllowedGuess, pickAnswer } from './words'

export interface GameOptions {
  /** Source of randomness for choosing answers (tests pass a fixed one). */
  random?: () => number
}

export function useGame(options: GameOptions = {}) {
  const random = options.random ?? Math.random
  const saved = loadGame()

  const answer = ref(saved?.answer ?? pickAnswer(random))
  const guesses = ref<string[]>(saved?.guesses ?? [])
  /** Hint steps used this game (ADR-0004): 0 none, 1 category, 2 definition. */
  const hintsUsed = ref(saved?.hints ?? 0)
  const current = ref('')
  const message = ref('')
  /** Bumped on every rejected guess so the board can shake the row. */
  const rejections = ref(0)
  const stats = ref(loadStats())

  const scored = computed<ScoredGuess[]>(() =>
    guesses.value.map((word) => ({ word, states: scoreGuess(word, answer.value) })),
  )

  const status = computed<GameStatus>(() => {
    if (guesses.value[guesses.value.length - 1] === answer.value) return 'won'
    if (guesses.value.length >= MAX_GUESSES) return 'lost'
    return 'playing'
  })

  const keys = computed(() => keyboardStates(scored.value))

  /** The current answer's clues (always defined for words from the answer list). */
  const clue = computed(() => clueFor(answer.value))

  function persist() {
    saveGame({ answer: answer.value, guesses: guesses.value, hints: hintsUsed.value })
  }

  /** Reveal the next hint step. Saved immediately, so a reload can't undo it. */
  function useHint() {
    if (status.value !== 'playing' || hintsUsed.value >= MAX_HINTS) return
    hintsUsed.value++
    persist()
  }

  function reject(text: string) {
    message.value = text
    rejections.value++
  }

  function addLetter(letter: string) {
    if (status.value !== 'playing' || current.value.length >= WORD_LENGTH) return
    current.value += letter.toUpperCase()
    message.value = ''
  }

  function removeLetter() {
    if (status.value !== 'playing') return
    current.value = current.value.slice(0, -1)
    message.value = ''
  }

  function submit() {
    if (status.value !== 'playing') return
    if (current.value.length < WORD_LENGTH) return reject('Not enough letters')
    if (!isAllowedGuess(current.value)) return reject('Not in word list')

    guesses.value = [...guesses.value, current.value]
    current.value = ''
    message.value = ''

    // Stats change only on the submit that ends the game, so reloading a
    // finished game never counts it twice.
    if (status.value !== 'playing') {
      stats.value = recordResult(stats.value, status.value === 'won', guesses.value.length)
      saveStats(stats.value)
    }
    persist()
  }

  function newGame() {
    answer.value = pickAnswer(random, answer.value)
    guesses.value = []
    hintsUsed.value = 0
    current.value = ''
    message.value = ''
    persist()
  }

  /** Map a physical or on-screen key name to an action. */
  function press(key: string) {
    if (key === 'Enter') submit()
    else if (key === 'Backspace') removeLetter()
    else if (/^[a-zA-Z]$/.test(key)) addLetter(key)
  }

  return {
    answer,
    current,
    message,
    rejections,
    stats,
    scored,
    status,
    keys,
    clue,
    hintsUsed,
    useHint,
    press,
    newGame,
  }
}
