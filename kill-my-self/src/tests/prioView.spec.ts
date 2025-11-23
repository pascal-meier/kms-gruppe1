import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import PrioView from '../components/prio.vue'

// 🔧 Composable mocken (isolierter Komponententest!)
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

describe('PrioView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ======================================
  // 1) Test: Hinzufügen neuer Priorität
  // ======================================
  it('adds a new priority via the form', async () => {
    const wrapper = mount(PrioView)

    // Inputs ausfüllen
    await wrapper.find('input[placeholder="Key (z.B. high)"]').setValue('urgent')
    await wrapper.find('input[placeholder="Label (z.B. Hoch)"]').setValue('Dringend')
    await wrapper.find('input[type="number"]').setValue('0')

    // Formular absenden
    await wrapper.find('form').trigger('submit.prevent')

    // Erwartung: Composable wurde korrekt benutzt
    expect(addPrioMock).toHaveBeenCalledWith({
      key: 'urgent',
      label: 'Dringend',
      weight: 0
    })

    // Felder sollten wieder leer sein
    const keyInput = wrapper.find('input[placeholder="Key (z.B. high)"]').element as HTMLInputElement
    expect(keyInput.value).toBe('')

    const labelInput = wrapper.find('input[placeholder="Label (z.B. Hoch)"]').element as HTMLInputElement
    expect(labelInput.value).toBe('')

    const weightInput = wrapper.find('input[type="number"]').element as HTMLInputElement
    expect(weightInput.value).toBe('1')

  })

  // ======================================
  // 2) Test: Löschen einer Priorität
  // ======================================
  it('deletes a priority when delete button is clicked', async () => {
    const wrapper = mount(PrioView)

    // 🔍 Erster Delete-Button in der Liste
    const deleteButton = wrapper.find('button:nth-of-type(2)') 
    // Erklärung: Button 1 = "Hinzufügen", Button 2 = 🗑

    await deleteButton.trigger('click')

    expect(deletePrioMock).toHaveBeenCalledWith('high')
  })
})
