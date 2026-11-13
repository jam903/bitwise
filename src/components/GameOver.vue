<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { GameStatus, Stats } from '@/game/types'
import type { Clue } from '@/game/words'

const props = defineProps<{
  status: Exclude<GameStatus, 'playing'>
  answer: string
  guessCount: number
  stats: Stats
  clue: Clue | undefined
  hintsUsed: number
}>()

const emit = defineEmits<{ 'play-again': [] }>()

const winRate = computed(() =>
  props.stats.played === 0 ? 0 : Math.round((100 * props.stats.wins) / props.stats.played),
)

const button = ref<HTMLButtonElement | null>(null)
onMounted(() => button.value?.focus())
</script>

<template>
  <section class="panel" aria-labelledby="result-heading">
    <h2 id="result-heading">
      <template v-if="status === 'won'">
        Solved in {{ guessCount }}/6<template v-if="hintsUsed > 0"> with a hint</template>
      </template>
      <template v-else>Out of guesses</template>
    </h2>
    <p class="answer">
      The word was <strong>{{ answer }}</strong>
      <template v-if="clue"> · {{ clue.category }}</template>
    </p>
    <p v-if="clue" class="definition">{{ clue.definition }}</p>

    <dl class="stats">
      <div>
        <dt>Played</dt>
        <dd>{{ stats.played }}</dd>
      </div>
      <div>
        <dt>Win %</dt>
        <dd>{{ winRate }}</dd>
      </div>
      <div>
        <dt>Streak</dt>
        <dd>{{ stats.currentStreak }}</dd>
      </div>
      <div>
        <dt>Best</dt>
        <dd>{{ stats.maxStreak }}</dd>
      </div>
    </dl>

    <table class="distribution">
      <caption>Wins by number of guesses</caption>
      <thead>
        <tr>
          <th v-for="n in 6" :key="n" scope="col">{{ n }}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td
            v-for="(count, i) in stats.distribution"
            :key="i"
            :class="{ current: status === 'won' && i === guessCount - 1 }"
          >
            {{ count }}
          </td>
        </tr>
      </tbody>
    </table>

    <button ref="button" type="button" class="again" @click="emit('play-again')">Play again</button>
  </section>
</template>

<style scoped>
.panel {
  width: min(100%, 360px);
  margin: 0 auto;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) * 1.5);
  background: var(--surface);
  text-align: center;
}

h2 {
  margin: 0;
  font-size: 1.25rem;
}

.answer {
  margin: 4px 0 4px;
  color: var(--muted);
}

.definition {
  margin: 0 0 12px;
  font-size: 0.9rem;
  line-height: 1.35;
}

.answer strong {
  color: var(--text);
  font-family: var(--font-mono);
  letter-spacing: 0.1em;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0 0 12px;
}

.stats dt {
  font-size: 0.75rem;
  color: var(--muted);
}

.stats dd {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.distribution {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 14px;
  font-variant-numeric: tabular-nums;
}

.distribution caption {
  font-size: 0.75rem;
  color: var(--muted);
  margin-bottom: 4px;
}

.distribution th {
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 600;
}

.distribution td {
  padding: 4px 0;
  border-radius: 4px;
}

.distribution td.current {
  background: var(--correct);
  color: var(--on-correct);
  font-weight: 700;
}

.again {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: var(--radius);
  background: var(--accent);
  color: var(--on-accent);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

/* Short screens: tighter panel so "Play again" stays on screen. */
@media (max-height: 700px) {
  .panel {
    padding: 10px 14px;
  }
  .stats {
    margin-bottom: 6px;
  }
  .stats dd {
    font-size: 1.15rem;
  }
  .distribution {
    margin-bottom: 8px;
  }
  .again {
    padding: 10px;
  }
}

.again:focus-visible {
  outline: 3px solid var(--text);
  outline-offset: 2px;
}
</style>
