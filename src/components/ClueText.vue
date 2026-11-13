<script setup lang="ts">
import type { Clue } from '@/game/words'

defineProps<{
  clue: Clue | undefined
  hintsUsed: number
}>()
</script>

<template>
  <!-- Always rendered so screen readers announce each clue as it appears. -->
  <div class="clue" aria-live="polite">
    <template v-if="clue && hintsUsed > 0">
      <p><span class="tag">Category</span> {{ clue.category }}</p>
      <p v-if="hintsUsed > 1"><span class="tag">Definition</span> {{ clue.definition }}</p>
    </template>
  </div>
</template>

<style scoped>
.clue {
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.35;
}

.clue:empty {
  display: none;
}

p {
  margin: 0 auto 4px;
  max-width: 34em;
}

.tag {
  display: inline-block;
  margin-right: 6px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--key);
  color: var(--key-text);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  vertical-align: 1px;
}
</style>
