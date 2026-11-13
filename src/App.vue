<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import ClueText from '@/components/ClueText.vue'
import GameBoard from '@/components/GameBoard.vue'
import GameKeyboard from '@/components/GameKeyboard.vue'
import GameOver from '@/components/GameOver.vue'
import HintButton from '@/components/HintButton.vue'
import { useGame } from '@/game/useGame'

const {
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
} = useGame()

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

    <ClueText v-if="status === 'playing'" :clue="clue" :hints-used="hintsUsed" />

    <!-- The board takes whatever height is left, so adding the hint rows never
         pushes the keyboard off a short phone screen. -->
    <div class="board-area">
      <GameBoard :scored="scored" :current="current" :rejections="rejections" />
    </div>

    <GameOver
      v-if="status !== 'playing'"
      :status="status"
      :answer="answer"
      :guess-count="scored.length"
      :stats="stats"
      :clue="clue"
      :hints-used="hintsUsed"
      @play-again="newGame"
    />
    <template v-else>
      <HintButton :hints-used="hintsUsed" @hint="useHint" />
      <GameKeyboard :keys="keys" @key="press" />
    </template>
  </main>
</template>

<style scoped>
.app {
  height: 100dvh;
  max-width: 520px;
  margin: 0 auto;
  padding: 12px 16px max(12px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  min-height: 1.4em;
  margin: 0;
  text-align: center;
  font-weight: 600;
}

/* Short phones (e.g. 360x640): drop the tagline and tighten spacing so the
   clue, board, hint button, and keyboard all fit without scrolling. */
@media (max-height: 700px) {
  .app {
    gap: 8px;
    padding-top: 8px;
  }
  .tagline {
    display: none;
  }
  h1 {
    font-size: 1.4rem;
    margin-bottom: 4px;
  }
}

.board-area {
  flex: 1 1 0;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* GameBoard sizes itself against this box's height (cqh units). */
  container-type: size;
}
</style>
