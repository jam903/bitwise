<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { MAX_GUESSES, WORD_LENGTH, type LetterState, type ScoredGuess } from '@/game/types'

const props = defineProps<{
  scored: ScoredGuess[]
  current: string
  /** Increments on each rejected guess; the active row shakes. */
  rejections: number
}>()

type TileState = LetterState | 'typed' | 'empty'

interface Tile {
  letter: string
  state: TileState
}

const LABEL: Record<TileState, string> = {
  correct: 'right place',
  present: 'wrong place',
  absent: 'not in word',
  typed: '',
  empty: '',
}

const rows = computed<Tile[][]>(() =>
  Array.from({ length: MAX_GUESSES }, (_, r) => {
    const guess = props.scored[r]
    return Array.from({ length: WORD_LENGTH }, (_, i): Tile => {
      if (guess) return { letter: guess.word.charAt(i), state: guess.states[i] ?? 'absent' }
      if (r === props.scored.length) {
        const letter = props.current.charAt(i)
        return { letter, state: letter ? 'typed' : 'empty' }
      }
      return { letter: '', state: 'empty' }
    })
  }),
)

const shaking = ref(false)
watch(
  () => props.rejections,
  () => {
    shaking.value = false
    requestAnimationFrame(() => (shaking.value = true))
    setTimeout(() => (shaking.value = false), 450)
  },
)
</script>

<template>
  <ol class="board" aria-label="Guesses">
    <li
      v-for="(row, r) in rows"
      :key="r"
      class="row"
      :class="{ shake: shaking && r === scored.length }"
    >
      <span
        v-for="(tile, i) in row"
        :key="i"
        class="tile"
        :class="tile.state"
        :style="{ '--i': i }"
      >
        <span aria-hidden="true">{{ tile.letter }}</span>
        <span v-if="tile.letter" class="sr-only">{{ tile.letter }} {{ LABEL[tile.state] }}</span>
      </span>
    </li>
  </ol>
</template>

<style scoped>
.board {
  list-style: none;
  margin: 0 auto;
  padding: 0;
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  gap: 6px;
  /* Six rows are 1.2x the width of five columns, so 82% of the available
     height keeps the whole board visible (cqh = the board-area container). */
  width: min(100%, 330px, 82cqh);
  /* Letters size against the board's own width (cqw below), so a shrunken
     board never has letters taller than their tiles. */
  container-type: inline-size;
}

.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.tile {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  min-height: 0;
  overflow: hidden;
  font-family: var(--font-mono);
  /* A fixed minimum font (the old clamp(1.5rem, …)) made letters taller than
     small tiles, and aspect-ratio then let the tiles grow: the board spilled
     over the hint button on a 360x640 screen. */
  font-size: min(2rem, 9cqw);
  line-height: 1;
  font-weight: 700;
  text-transform: uppercase;
  user-select: none;
  transition:
    background-color 220ms ease,
    border-color 220ms ease,
    color 220ms ease,
    transform 220ms ease;
  transition-delay: calc(var(--i) * 110ms);
}

.tile.typed {
  border-color: var(--border-strong);
  animation: pop 120ms ease-out;
  transition-delay: 0ms;
}

.tile.correct,
.tile.present,
.tile.absent {
  border-color: transparent;
}

.tile.correct {
  background: var(--correct);
  color: var(--on-correct);
}

.tile.present {
  background: var(--present);
  color: var(--on-present);
}

.tile.absent {
  background: var(--absent);
  color: var(--on-absent);
}

.shake {
  animation: shake 400ms ease;
}

@keyframes pop {
  50% {
    transform: scale(1.08);
  }
}

@keyframes shake {
  20%,
  60% {
    transform: translateX(-6px);
  }
  40%,
  80% {
    transform: translateX(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile,
  .tile.typed,
  .shake {
    animation: none;
    transition: none;
  }
}
</style>
