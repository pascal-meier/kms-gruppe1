import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiCard from './uiCard.vue'

describe('UiCard', () => {
  it('should render card with title', () => {
    const wrapper = mount(UiCard, {
      props: {
        title: 'Test Card',
      },
      slots: {
        default: 'Card Content',
      },
    })

    expect(wrapper.text()).toContain('Test Card')
    expect(wrapper.text()).toContain('Card Content')
  })

  it('should render card with subtitle', () => {
    const wrapper = mount(UiCard, {
      props: {
        title: 'Test Card',
        subtitle: 'Test Subtitle',
      },
    })

    expect(wrapper.text()).toContain('Test Subtitle')
  })

  it('should render card with icon', () => {
    const wrapper = mount(UiCard, {
      props: {
        title: 'Test Card',
        icon: '⭐',
      },
    })

    expect(wrapper.text()).toContain('⭐')
    expect(wrapper.find('.card-icon').exists()).toBe(true)
  })

  it('should not render icon when not provided', () => {
    const wrapper = mount(UiCard, {
      props: {
        title: 'Test Card',
      },
    })

    expect(wrapper.find('.card-icon').exists()).toBe(false)
  })

  it('should render slot content', () => {
    const wrapper = mount(UiCard, {
      props: {
        title: 'Test Card',
      },
      slots: {
        default: '<p>Custom Content</p>',
      },
    })

    expect(wrapper.html()).toContain('Custom Content')
  })

  it('should apply custom class from class attribute', () => {
    const wrapper = mount(UiCard, {
      props: {
        title: 'Test Card',
      },
      attrs: {
        class: 'custom-class',
      },
    })

    expect(wrapper.find('.card.custom-class').exists()).toBe(true)
  })

  it('should have correct structure', () => {
    const wrapper = mount(UiCard, {
      props: {
        title: 'Test Card',
        subtitle: 'Subtitle',
        icon: '📝',
      },
    })

    expect(wrapper.find('.card').exists()).toBe(true)
    expect(wrapper.find('.card-header').exists()).toBe(true)
    expect(wrapper.find('.card-titles').exists()).toBe(true)
    expect(wrapper.find('.card-title').exists()).toBe(true)
    expect(wrapper.find('.card-subtitle').exists()).toBe(true)
    expect(wrapper.find('.card-content').exists()).toBe(true)
  })
})

