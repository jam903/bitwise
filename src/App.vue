<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import GameBoard from '@/components/GameBoard.vue'
import GameKeyboard from '@/components/GameKeyboard.vue'
import GameOver from '@/components/GameOver.vue'
import { useGame } from '@/game/useGame'

const { answer, current, message, rejections, stats, scored, status, keys, press, newGame } =
  useGame()

function onKeydown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  // Enter on a focused button belongs to that button (e.g. "Play again").
  if (event.key === 'Enter' && event.target instanceof HTMLButtonElement) return
  if (event.key === 'Enter' || event.key === 'Backspace' || /^[a-zA-Z]$/.test(event.key)) {
    event.preventDefault()
    press(event.key)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <main class="app">
    <header class="header">
      <h1>Bitwise</h1>
      <p class="tagline">Guess the five-letter computer-science term in six tries.</p>
      <ul class="legend" aria-label="Color key">
        <li><span class="swatch correct" aria-hidden="true"></span>right place</li>
        <li><span class="swatch present" aria-hidden="true"></span>wrong place</li>
        <li><span class="swatch absent" aria-hidden="true"></span>not in word</li>
      </ul>
    </header>

    <p class="message" role="status" aria-live="polite">{{ message }}</p>

    <GameBoard :scored="scored" :current="current" :rejections="rejections" />

    <GameOver
      v-if="status !== 'playing'"
      :status="status"
      :answer="answer"
      :guess-count="scored.length"
      :stats="stats"
      @play-again="newGame"
    />
    <GameKeyboard v-else :keys="keys" @key="press" />
  </main>
</template>

<style scoped>
.app {
  min-height: 100dvh;
  max-width: 520px;
  margin: 0 auto;
  padding: 16px 16px max(16px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header {
  text-align: center;
}

h1 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 1.75rem;
  letter-spacing: 0.08em;
}

.tagline {
  margin: 4px 0 8px;
  color: var(--muted);
  font-size: 0.9rem;
}

.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px 14px;
  font-size: 0.8rem;
  color: var(--muted);
}

.legend li {
  display: flex;
  align-items: center;
  gap: 6px;
}

.swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px var(--border-strong);
}

.swatch.correct {
  background: var(--correct);
}

.swatch.present {
  background: var(--present);
}

.swatch.absent {
  background: var(--absent);
}

.message {
  min-height: 1.5em;
  margin: 0;
  text-align: center;
  font-weight: 600;
}
</style>
