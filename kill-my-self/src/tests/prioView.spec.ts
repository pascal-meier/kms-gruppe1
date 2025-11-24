import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import PrioView from '../components/prio.vue'

// Composable-Mocks, damit der Test rein die UI-Interaktion prüft.
const addPrioMock = vi.fn()
const deletePrioMock = vi.fn()

vi.mock('../composable/usePrios.ts', () => ({
  usePrios: () => ({
    prios: ref([
      { key: 'high', label: 'Hoch', weight: 1 },
    ]),
    addPrio: addPrioMock,
    deletePrio: deletePrioMock,
  }),
}))

// Hilfsfunktion: UiCard stubben, damit das Layout die Tests nicht beeinflusst.
const mountWithStubs = () =>
  mount(PrioView, {
    global: {
      stubs: {
        UiCard: { template: '<section><slot /></section>' },
      },
    },
  })

describe('PrioView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('adds a new priority via the form', async () => {
    const wrapper = mountWithStubs()

    // Formulareingaben ausfüllen und absenden.
    await wrapper.find('input[placeholder=\"Key (z.B. high)\"]').setValue('urgent')
    await wrapper.find('input[placeholder=\"Label (z.B. Hoch)\"]').setValue('Dringend')
    await wrapper.find('input[type=\"number\"]').setValue('0')
    await wrapper.find('form').trigger('submit.prevent')

    // Composable wurde mit den Formdaten aufgerufen.
    expect(addPrioMock).toHaveBeenCalledWith({
      key: 'urgent',
      label: 'Dringend',
      weight: 0,
    })

    // Eingabefelder werden zurückgesetzt.
    const keyInput = wrapper.find('input[placeholder=\"Key (z.B. high)\"]').element as HTMLInputElement
    expect(keyInput.value).toBe('')

    const labelInput = wrapper.find('input[placeholder=\"Label (z.B. Hoch)\"]').element as HTMLInputElement
    expect(labelInput.value).toBe('')

    const weightInput = wrapper.find('input[type=\"number\"]').element as HTMLInputElement
    expect(weightInput.value).toBe('1')
  })

  it('deletes a priority when delete button is clicked', async () => {
    const wrapper = mountWithStubs()

    // Delete-Button im Listeneintrag klicken.
    const deleteButton = wrapper.find('li button')
    await deleteButton.trigger('click')

    expect(deletePrioMock).toHaveBeenCalledWith('high')
  })
})
