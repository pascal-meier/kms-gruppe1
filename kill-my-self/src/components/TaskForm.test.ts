import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskForm from './TaskForm.vue'
import type { ID, Task } from '../composable/useTasks'

describe('TaskForm', () => {
  const mockPrios = [
    { key: 'high', label: 'Hoch', weight: 1 },
    { key: 'medium', label: 'Mittel', weight: 2 },
    { key: 'low', label: 'Niedrig', weight: 3 },
  ]

  const defaultProps = {
    prios: mockPrios,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render form for new task', () => {
    const wrapper = mount(TaskForm, {
      props: defaultProps,
    })

    expect(wrapper.find('h2').text()).toBe('Neue Aufgabe')
    expect(wrapper.find('input[placeholder*="Wäsche"]').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Anlegen')
  })

  it('should render form for editing task', async () => {
    const task: Task = {
      title: 'Test Task',
      description: 'Test Description',
      priority: 1,
      done: false,
      updatedAt: new Date().toISOString(),
    }

    const wrapper = mount(TaskForm, {
      props: {
        ...defaultProps,
        modelValue: { id: 'task-1' as ID, data: task },
      },
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('h2').text()).toBe('Aufgabe bearbeiten')
    const titleInput = wrapper.find('input[placeholder*="Wäsche"]')
    expect(titleInput.exists()).toBe(true)
    expect((titleInput.element as HTMLInputElement).value).toBe('Test Task')
    expect(wrapper.find('textarea').element.value).toBe('Test Description')
    expect(wrapper.find('button[type="submit"]').text()).toBe('Speichern')
    expect(wrapper.find('button.ghost').exists()).toBe(true)
  })

  it('should populate form fields when editing', async () => {
    const task: Task = {
      title: 'Edit Me',
      description: 'Edit Description',
      priority: 3,
      done: false,
      updatedAt: new Date().toISOString(),
    }

    const wrapper = mount(TaskForm, {
      props: {
        ...defaultProps,
        modelValue: { id: 'task-1' as ID, data: task },
      },
    })

    await wrapper.vm.$nextTick()

    const titleInput = wrapper.find('input[placeholder*="Wäsche"]').element as HTMLInputElement
    const descTextarea = wrapper.find('textarea').element as HTMLTextAreaElement
    const select = wrapper.find('select').element as HTMLSelectElement

    expect(titleInput.value).toBe('Edit Me')
    expect(descTextarea.value).toBe('Edit Description')
    expect(select.value).toBe('3')
  })

  it('should clear form when modelValue becomes null', async () => {
    const task: Task = {
      title: 'Test',
      priority: 1,
      done: false,
      updatedAt: new Date().toISOString(),
    }

    const wrapper = mount(TaskForm, {
      props: {
        ...defaultProps,
        modelValue: { id: 'task-1' as ID, data: task },
      },
    })

    await wrapper.setProps({ modelValue: null })
    await wrapper.vm.$nextTick()

    const titleInput = wrapper.find('input[placeholder*="Wäsche"]')
    expect(titleInput.exists()).toBe(true)
    expect((titleInput.element as HTMLInputElement).value).toBe('')
  })

  it('should call onSubmit with correct payload when submitting new task', async () => {
    const onSubmit = vi.fn()
    const wrapper = mount(TaskForm, {
      props: {
        ...defaultProps,
        onSubmit,
      },
    })

    await wrapper.find('input[placeholder*="Wäsche"]').setValue('New Task')
    await wrapper.find('textarea').setValue('New Description')
    await wrapper.find('select').setValue('1')

    await wrapper.find('form').trigger('submit.prevent')

    expect(onSubmit).toHaveBeenCalledWith({
      data: {
        title: 'New Task',
        description: 'New Description',
        priority: 1,
      },
    })
  })

  it('should call onSubmit with id when editing task', async () => {
    const onSubmit = vi.fn()
    const task: Task = {
      title: 'Original',
      priority: 2,
      done: false,
      updatedAt: new Date().toISOString(),
    }

    const wrapper = mount(TaskForm, {
      props: {
        ...defaultProps,
        modelValue: { id: 'task-123' as ID, data: task },
        onSubmit,
      },
    })

    await wrapper.find('input[placeholder*="Wäsche"]').setValue('Updated')
    await wrapper.find('form').trigger('submit.prevent')

    expect(onSubmit).toHaveBeenCalledWith({
      id: 'task-123',
      data: {
        title: 'Updated',
        description: '',
        priority: 2,
      },
    })
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    const task: Task = {
      title: 'Test',
      priority: 1,
      done: false,
      updatedAt: new Date().toISOString(),
    }

    const wrapper = mount(TaskForm, {
      props: {
        ...defaultProps,
        modelValue: { id: 'task-1' as ID, data: task },
        onCancel,
      },
    })

    await wrapper.find('button.ghost').trigger('click')

    expect(onCancel).toHaveBeenCalled()
  })

  it('should not show cancel button for new task', () => {
    const wrapper = mount(TaskForm, {
      props: defaultProps,
    })

    expect(wrapper.find('button.ghost').exists()).toBe(false)
  })

  it('should have required attribute on title input', () => {
    const wrapper = mount(TaskForm, {
      props: defaultProps,
    })

    const titleInput = wrapper.find('input[placeholder*="Wäsche"]')
    expect(titleInput.exists()).toBe(true)
    expect(titleInput.attributes('required')).toBeDefined()
  })

  it('should render all priority options', () => {
    const wrapper = mount(TaskForm, {
      props: defaultProps,
    })

    const options = wrapper.findAll('select option')
    expect(options.length).toBe(mockPrios.length)
    expect(options[0].text()).toBe('Hoch')
    expect(options[1].text()).toBe('Mittel')
    expect(options[2].text()).toBe('Niedrig')
  })
})

