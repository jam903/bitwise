<script setup lang="ts">
import { computed } from 'vue'
import { MAX_HINTS } from '@/game/types'

const props = defineProps<{
  hintsUsed: number
}>()

const emit = defineEmits<{ hint: [] }>()

const label = computed(() => {
  if (props.hintsUsed === 0) return 'Hint: show category'
  if (props.hintsUsed === 1) return 'Hint: show definition'
  return 'No hints left'
})

function onClick(event: MouseEvent) {
  emit('hint')
  // After a mouse/touch click, drop focus: otherwise the next physical Enter
  // would re-click this button (spending the second hint) instead of
  // submitting the guess. Keyboard activation (detail === 0) keeps focus.
  if (event.detail > 0) (event.currentTarget as HTMLElement).blur()
}
</script>

<template>
  <div class="bar">
    <button type="button" class="hint" :disabled="hintsUsed >= MAX_HINTS" @click="onClick">
      {{ label }}
    </button>
  </div>
</template>

<style scoped>
.bar {
  display: flex;
  justify-content: center;
}

.hint {
  padding: 8px 16px;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
}

.hint:hover:not(:disabled) {
  background: var(--key);
}

.hint:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.hint:disabled {
  border-color: var(--border);
  color: var(--muted);
  cursor: default;
}
</style>
