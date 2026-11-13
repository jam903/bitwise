import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '../App.vue'

// Start from a saved in-progress game so the answer is known (ADR-0003 restore).
function startWithAnswer(answer: string) {
  localStorage.setItem('cs-word-game:game:v1', JSON.stringify({ answer, guesses: [] }))
}

async function typeOnPhysicalKeyboard(word: string) {
  for (const key of [...word, 'Enter']) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }))
  }
  await nextTick()
}

function rowText(wrapper: VueWrapper, row: number): string {
  const tiles = wrapper.findAll('.board .row')[row]?.findAll('.tile') ?? []
  return tiles.map((t) => t.find('[aria-hidden]').text()).join('')
}

let wrapper: VueWrapper

beforeEach(() => {
  localStorage.clear()
  startWithAnswer('STACK')
  wrapper = mount(App, { attachTo: document.body })
})

afterEach(() => wrapper.unmount())

describe('App', () => {
  it('colors a submitted guess on the board and on the keyboard', async () => {
    await typeOnPhysicalKeyboard('CRANE')

    const tiles = wrapper.findAll('.board .tile').slice(0, 5)
    expect(tiles.map((t) => t.classes().find((c) => ['correct', 'present', 'absent'].includes(c)))).toEqual([
      'present', // C is in STACK, wrong place
      'absent',
      'correct', // A is third in both
      'absent',
      'absent',
    ])
    expect(wrapper.find('button[aria-label="A, right place"]').exists()).toBe(true)
  })

  it('shows the result panel on a win and starts a new game on "Play again"', async () => {
    await typeOnPhysicalKeyboard('CRANE')
    await typeOnPhysicalKeyboard('STACK')

    expect(wrapper.text()).toContain('Solved in 2/6')
    expect(wrapper.find('.keyboard').exists()).toBe(false)

    await wrapper.find('button.again').trigger('click')
    expect(rowText(wrapper, 0)).toBe('')
    expect(wrapper.find('.keyboard').exists()).toBe(true)
  })

  it('accepts a guess typed entirely on the on-screen keyboard', async () => {
    for (const key of ['S', 'T', 'A', 'C', 'K']) {
      await wrapper.find(`button[aria-label="${key}"]`).trigger('click')
    }
    await wrapper.find('button[aria-label="Submit guess"]').trigger('click')

    expect(wrapper.text()).toContain('Solved in 1/6')
  })

  it('tells the player when a guess is not a word', async () => {
    await typeOnPhysicalKeyboard('XQZZV')
    expect(wrapper.find('[role="status"]').text()).toBe('Not in word list')
  })
})
