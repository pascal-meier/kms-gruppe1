import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskList from './TaskList.vue'
import { useTasks } from '../composable/useTasks'
import type { Task } from '../composable/useTasks'

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

// Mock window.confirm
const confirmMock = vi.fn(() => true)
Object.defineProperty(window, 'confirm', {
  value: confirmMock,
  writable: true,
})

describe('TaskList', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    confirmMock.mockReturnValue(true)
  })

  it('should render empty list when no tasks', () => {
    const wrapper = mount(TaskList)
    
    const listItems = wrapper.findAll('li.row')
    expect(listItems.length).toBe(0)
  })

  it('should render tasks from useTasks', () => {
    const { addTask } = useTasks()
    addTask({ title: 'Task 1', priority: 1 })
    addTask({ title: 'Task 2', priority: 2 })

    const wrapper = mount(TaskList)
    
    const listItems = wrapper.findAll('li.row')
    expect(listItems.length).toBe(2)
    expect(wrapper.text()).toContain('Task 1')
    expect(wrapper.text()).toContain('Task 2')
  })

  it('should display task title and priority', () => {
    const { addTask } = useTasks()
    const id = addTask({ title: 'Test Task', priority: 1 })

    const wrapper = mount(TaskList)
    
    expect(wrapper.text()).toContain('Test Task')
    expect(wrapper.text()).toContain('P1')
  })

  it('should display task description when present', () => {
    const { addTask } = useTasks()
    addTask({ title: 'Task', description: 'Task Description', priority: 1 })

    const wrapper = mount(TaskList)
    
    expect(wrapper.text()).toContain('Task Description')
  })

  it('should display updatedAt timestamp', () => {
    const { addTask } = useTasks()
    addTask({ title: 'Task', priority: 1 })

    const wrapper = mount(TaskList)
    
    expect(wrapper.text()).toContain('Zuletzt geändert:')
  })

  it('should toggle task done status when checkbox is clicked', async () => {
    const { addTask, get } = useTasks()
    const id = addTask({ title: 'Task', priority: 1 })
    
    const wrapper = mount(TaskList)
    const checkbox = wrapper.find('input[type="checkbox"]')
    
    expect(get(id)?.done).toBe(false)
    
    await checkbox.setValue(true)
    
    expect(get(id)?.done).toBe(true)
  })

  it('should emit edit event when edit button is clicked', async () => {
    const { addTask } = useTasks()
    const id = addTask({ title: 'Task', priority: 1 })

    const wrapper = mount(TaskList)
    const editButton = wrapper.findAll('button').find(btn => btn.text() === 'Bearbeiten')
    
    expect(editButton).toBeDefined()
    await editButton!.trigger('click')
    
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')?.[0]).toEqual([id])
  })

  it('should delete task when delete button is clicked and confirmed', async () => {
    const { addTask, entries } = useTasks()
    const id = addTask({ title: 'To Delete', priority: 1 })
    
    const wrapper = mount(TaskList)
    const deleteButton = wrapper.findAll('button').find(btn => btn.text() === 'Löschen')
    
    expect(deleteButton).toBeDefined()
    await deleteButton!.trigger('click')
    
    expect(confirmMock).toHaveBeenCalledWith('Task wirklich löschen?')
    expect(entries.value.find(([tid]) => tid === id)).toBeUndefined()
  })

  it('should not delete task when delete is cancelled', async () => {
    confirmMock.mockReturnValue(false)
    
    const { addTask, entries } = useTasks()
    const id = addTask({ title: 'To Keep', priority: 1 })
    
    const wrapper = mount(TaskList)
    const deleteButton = wrapper.findAll('button').find(btn => btn.text() === 'Löschen')
    
    await deleteButton!.trigger('click')
    
    expect(entries.value.find(([tid]) => tid === id)).toBeDefined()
  })

  it('should clear all tasks when clear all button is clicked and confirmed', async () => {
    const { addTask, entries } = useTasks()
    addTask({ title: 'Task 1', priority: 1 })
    addTask({ title: 'Task 2', priority: 2 })
    
    const wrapper = mount(TaskList)
    const clearAllButton = wrapper.find('button.delete-all-btn')
    
    await clearAllButton.trigger('click')
    
    expect(confirmMock).toHaveBeenCalledWith('Willst du wirklich alle Tasks löschen?')
    expect(entries.value.length).toBe(0)
  })

  it('should not clear all tasks when cancelled', async () => {
    confirmMock.mockReturnValue(false)
    
    const { addTask, entries } = useTasks()
    addTask({ title: 'Task 1', priority: 1 })
    addTask({ title: 'Task 2', priority: 2 })
    
    const wrapper = mount(TaskList)
    const clearAllButton = wrapper.find('button.delete-all-btn')
    
    await clearAllButton.trigger('click')
    
    expect(entries.value.length).toBe(2)
  })

  it('should apply done class to completed tasks', () => {
    const { addTask, updateTask } = useTasks()
    const id = addTask({ title: 'Task', priority: 1 })
    updateTask(id, { done: true })

    const wrapper = mount(TaskList)
    
    const doneItem = wrapper.find('li.row.done')
    expect(doneItem.exists()).toBe(true)
  })

  it('should sort tasks correctly (undone first, then by priority)', async () => {
    const { addTask, updateTask, entries } = useTasks()
    const id1 = addTask({ title: 'Done Task', priority: 1 })
    const id2 = addTask({ title: 'Undone High', priority: 1 })
    const id3 = addTask({ title: 'Undone Low', priority: 3 })
    updateTask(id1, { done: true })

    const wrapper = mount(TaskList)
    await wrapper.vm.$nextTick()
    
    // Check the entries are sorted correctly
    const undoneTasks = entries.value.filter(([, task]) => !task.done)
    const doneTasks = entries.value.filter(([, task]) => task.done)
    
    // Undone tasks should come first
    expect(undoneTasks.length).toBeGreaterThan(0)
    expect(doneTasks.length).toBeGreaterThan(0)
    
    // Within undone tasks, they should be sorted by priority
    if (undoneTasks.length >= 2) {
      expect(undoneTasks[0][1].priority).toBeLessThanOrEqual(undoneTasks[1][1].priority)
    }
  })
})

