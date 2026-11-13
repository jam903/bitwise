<script setup lang="ts">
import type { LetterState } from '@/game/types'

defineProps<{
  keys: Record<string, LetterState>
}>()

const emit = defineEmits<{ key: [key: string] }>()

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'],
]

const STATE_LABEL: Record<LetterState, string> = {
  correct: 'right place',
  present: 'wrong place',
  absent: 'not in word',
}

function press(key: string, event: MouseEvent) {
  emit('key', key)
  // After a mouse/touch click, drop focus so the next physical Enter submits
  // the guess instead of re-clicking this key. Keyboard activation
  // (detail === 0) keeps focus for keyboard-only players.
  if (event.detail > 0) (event.currentTarget as HTMLElement).blur()
}

function label(key: string, state: LetterState | undefined): string {
  if (key === 'Backspace') return 'Delete letter'
  if (key === 'Enter') return 'Submit guess'
  return state ? `${key}, ${STATE_LABEL[state]}` : key
}
</script>

<template>
  <div class="keyboard" role="group" aria-label="Keyboard">
    <div v-for="(row, r) in ROWS" :key="r" class="row">
      <button
        v-for="key in row"
        :key="key"
        type="button"
        class="key"
        :class="[keys[key], { wide: key.length > 1 }]"
        :aria-label="label(key, keys[key])"
        @click="press(key, $event)"
      >
        <span v-if="key === 'Backspace'" class="glyph" aria-hidden="true">⌫</span>
        <template v-else-if="key === 'Enter'">enter</template>
        <template v-else>{{ key }}</template>
      </button>
    </div>
  </div>
</template>

<style scoped>
.keyboard {
  display: grid;
  gap: 8px;
  width: min(100%, 500px);
  margin: 0 auto;
  user-select: none;
}

.row {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.key {
  flex: 1 1 0;
  min-width: 0;
  height: 56px;
  border: none;
  border-radius: var(--radius);
  background: var(--key);
  color: var(--key-text);
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
  transition: background-color 200ms ease, color 200ms ease;
}

.key.wide {
  flex: 1.5 1 0;
  font-size: 0.7rem;
  text-transform: uppercase;
}

.glyph {
  font-size: 1.35rem;
  line-height: 1;
}

.key:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.key.correct {
  background: var(--correct);
  color: var(--on-correct);
}

.key.present {
  background: var(--present);
  color: var(--on-present);
}

.key.absent {
  background: var(--absent);
  color: var(--on-absent);
}

@media (max-width: 360px) {
  .row {
    gap: 4px;
  }
  .key {
    height: 50px;
  }
}
</style>
