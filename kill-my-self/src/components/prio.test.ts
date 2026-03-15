import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Prio from './prio.vue'
import UiCard from './uiCard.vue'
import { usePrios } from '../composable/usePrios'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Prio', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('should render priority management form', () => {
    const wrapper = mount(Prio, {
      global: {
        components: {
          UiCard,
        },
      },
    })
    
    expect(wrapper.text()).toContain('Prioritäten')
    expect(wrapper.find('input[placeholder*="Key"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder*="Label"]').exists()).toBe(true)
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Hinzufügen')
  })

  it('should display existing priorities', () => {
    const wrapper = mount(Prio, {
      global: {
        components: {
          UiCard,
        },
      },
    })
    
    // Should show default priorities
    expect(wrapper.text()).toContain('Hoch')
    expect(wrapper.text()).toContain('Mittel')
    expect(wrapper.text()).toContain('Niedrig')
  })

  it('should add a new priority when form is submitted', async () => {
    const { prios } = usePrios()
    const initialCount = prios.value.length
    
    const wrapper = mount(Prio, {
      global: {
        components: {
          UiCard,
        },
      },
    })
    
    await wrapper.find('input[placeholder*="Key"]').setValue('urgent')
    await wrapper.find('input[placeholder*="Label"]').setValue('Dringend')
    await wrapper.find('input[type="number"]').setValue('0')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(prios.value.length).toBe(initialCount + 1)
    expect(prios.value.find(p => p.key === 'urgent')).toBeDefined()
  })

  it('should clear form fields after adding priority', async () => {
    const wrapper = mount(Prio, {
      global: {
        components: {
          UiCard,
        },
      },
    })
    
    const keyInput = wrapper.find('input[placeholder*="Key"]')
    const labelInput = wrapper.find('input[placeholder*="Label"]')
    const weightInput = wrapper.find('input[type="number"]')
    
    await keyInput.setValue('test')
    await labelInput.setValue('Test')
    await weightInput.setValue('5')
    
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    expect((keyInput.element as HTMLInputElement).value).toBe('')
    expect((labelInput.element as HTMLInputElement).value).toBe('')
    expect((weightInput.element as HTMLInputElement).value).toBe('1')
  })

  it('should delete priority when delete button is clicked', async () => {
    const { prios, addPrio } = usePrios()
    // Clear existing prios first to avoid interference
    const initialPrios = [...prios.value]
    prios.value = []
    
    addPrio({ key: 'to-delete', label: 'To Delete', weight: 1 })
    
    const wrapper = mount(Prio, {
      global: {
        components: {
          UiCard,
        },
      },
    })
    await wrapper.vm.$nextTick()
    
    // Verify it's in the list first
    expect(wrapper.text()).toContain('to-delete')
    
    // Find the delete button for the 'to-delete' priority
    const allButtons = wrapper.findAll('button')
    const deleteButton = allButtons.find(btn => {
      const text = btn.text()
      return text.includes('🗑️')
    })
    
    // Find the specific delete button by checking which list item it's in
    const listItems = wrapper.findAll('li')
    let targetDeleteButton = null
    for (const item of listItems) {
      if (item.text().includes('to-delete')) {
        targetDeleteButton = item.find('button')
        break
      }
    }
    
    expect(targetDeleteButton).toBeDefined()
    if (targetDeleteButton) {
      await targetDeleteButton.trigger('click')
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick() // Extra tick for reactivity
      
      // Check that the priority was removed
      expect(prios.value.find(p => p.key === 'to-delete')).toBeUndefined()
    }
  })

  it('should display priority details correctly', () => {
    const { addPrio } = usePrios()
    addPrio({ key: 'custom', label: 'Custom Priority', weight: 5 })
    
    const wrapper = mount(Prio, {
      global: {
        components: {
          UiCard,
        },
      },
    })
    
    expect(wrapper.text()).toContain('Custom Priority')
    expect(wrapper.text()).toContain('custom')
    expect(wrapper.text()).toContain('Gewichtung: 5')
  })

  it('should have required attributes on form inputs', () => {
    const wrapper = mount(Prio, {
      global: {
        components: {
          UiCard,
        },
      },
    })
    
    const keyInput = wrapper.find('input[placeholder*="Key"]')
    const labelInput = wrapper.find('input[placeholder*="Label"]')
    const weightInput = wrapper.find('input[type="number"]')
    
    expect(keyInput.attributes('required')).toBeDefined()
    expect(labelInput.attributes('required')).toBeDefined()
    expect(weightInput.attributes('required')).toBeDefined()
  })

  it('should render UiCard wrapper', () => {
    const wrapper = mount(Prio, {
      global: {
        components: {
          UiCard,
        },
      },
    })
    
    // Check if UiCard is rendered (it should have the title "Priorisierung")
    // The UiCard component wraps the content, so we check for the card structure
    expect(wrapper.findComponent(UiCard).exists()).toBe(true)
    const uiCard = wrapper.findComponent(UiCard)
    expect(uiCard.props('title')).toBe('Priorisierung')
  })
})

