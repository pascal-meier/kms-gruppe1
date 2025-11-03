<template>
  <div class="app">
    <header class="app-header">
      <h1>📝 KMS ToDo App</h1>
      <div class="toolbar"><!-- global actions --></div>
    </header>

    <main class="cards">
      <UiCard
          v-for="m in visibleModules"
          :key="m.key"
          :title="m.title"
          :subtitle="m.subtitle"
          :icon="m.icon"
      >
        <component :is="m.component" v-bind="m.props" />
      </UiCard>
    </main>
  </div>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue'
import Prio from './components/Prio.vue'

import TaskForm from './components/TaskForm.vue'
import TaskList from './components/TaskList.vue'
import { useTasks } from './composable/useTasks.ts'

const TasksModule = defineComponent({
  name: 'TasksModule',
  setup() {
    const { editingId, get, addTask, updateTask, setEditing } = useTasks()

    const editingPayload = () => {
      if (!editingId.value) return null
      const data = get(editingId.value)
      return data ? { id: editingId.value, data } : null
    }

    function onSubmit(payload) {
      if (payload.id) {
        updateTask(payload.id, payload.data)
        setEditing(null)
      } else {
        addTask(payload.data)
      }
    }
    const onCancelEdit = () => setEditing(null)

    return () =>
        h('div', { class: 'tasks-module' }, [
          h(TaskForm, { modelValue: editingPayload(), onSubmit, onCancel: onCancelEdit }),
          h(TaskList)
        ])
  }
})

const UiCard = defineComponent({
  name: 'UiCard',
  props: { title: String, subtitle: String, icon: String },
  setup(props, { slots }) {
    return () =>
        h('section', { class: 'card', role: 'region', 'aria-label': props.title || 'Karte' }, [
          (props.title || props.subtitle) &&
          h('header', { class: 'card-header' }, [
            props.icon ? h('span', { class: 'card-icon', 'aria-hidden': 'true' }, props.icon) : null,
            h('div', { class: 'card-titles' }, [
              props.title ? h('h2', { class: 'card-title' }, props.title) : null,
              props.subtitle ? h('p', { class: 'card-subtitle' }, props.subtitle) : null
            ])
          ]),
          h('div', { class: 'card-content' }, slots.default ? slots.default() : null)
        ])
  }
})

const modules = [
  { key: 'tasks', title: '📋 Aufgabenliste', subtitle: 'Erstellen, Bearbeiten, Erledigen, Löschen', icon: '📦', component: TasksModule, props: {} },
  { key: 'prio',  title: '🧭 Priorisierung',  subtitle: 'Stufen verwalten & zuweisen',         icon: '⭐', component: Prio,        props: {} },
]

const visibleModules = computed(() => modules)
</script>

<style scoped>
:root { --bg:#f5f7fa; --card-bg:#fff; --text:#111; --muted:#6b7280; --border:#e5e7eb; --shadow:0 3px 10px rgba(0,0,0,.08); --shadow-hover:0 6px 18px rgba(0,0,0,.12); --radius:16px; --space:1.5rem; }
.app { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; padding: 2rem; max-width: 1100px; margin: 0 auto; color: var(--text); }
.app-header { display:flex; align-items:end; justify-content:space-between; gap:1rem; margin-bottom:2rem; }
h1 { margin:0; font-size:1.8rem; }
.cards { display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space); }
.card { background:var(--card-bg); border:1px solid var(--border); border-radius:var(--radius); box-shadow:var(--shadow); padding:1.25rem; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
.card:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); border-color: #d9dce2; }
.card-header { display:flex; align-items:center; gap:.75rem; margin-bottom:1rem; }
.card-icon { font-size:1.5rem; line-height:1; }
.card-titles { display:flex; flex-direction:column; gap:.15rem; }
.card-title { font-size:1.1rem; margin:0; }
.card-subtitle { margin:0; font-size:.9rem; color:var(--muted); }
.tasks-module { display:grid; gap:1rem; }
:global(body) { background: var(--bg); }
</style>
