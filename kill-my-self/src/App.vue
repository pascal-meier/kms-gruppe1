<template>
  <div class="app">
    <a class="skip-link" href="#main-content">Zum Inhalt springen</a>
    <header class="app-header" role="banner">
      <h1>📝 KMS ToDo App</h1>
      <div class="toolbar" aria-label="Globale Aktionen"></div>
    </header>
    <main id="main-content" class="cards" role="main">
      <div class="left-column">
        <UiCard
          title="Neue Aufgabe"
          subtitle="Aufgabe erstellen oder bearbeiten"
          icon="📝"
          class="taskform"
        >
          <TaskForm
            :key="editingId || 'default-key'"
            :modelValue="editingPayload"
            :prios="prios"
            :onSubmit="onSubmit"
            :onCancel="onCancelEdit"
          />
        </UiCard>
        <UiCard
          title="Priorisierung"
          subtitle="Stufen verwalten & zuweisen"
          icon="⭐"
          class="prio"
        >
          <Prio />
        </UiCard>
      </div>
      <div class="right-column">
        <UiCard
          title="📋 Aufgabenliste"
          subtitle="Alle Aufgaben ansehen"
          icon="📦"
          class="tasklist"
        >
          <TaskList @edit="setEditing" />
        </UiCard>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiCard from './components/uiCard.vue'
import Prio from './components/prio.vue'
import TaskForm from './components/TaskForm.vue'
import TaskList from './components/TaskList.vue'
import { useTasks } from './composable/useTasks.ts'
import { usePrios } from './composable/usePrios.ts'
import './assets/styles/global.css'

const { prios } = usePrios()
const { editingId, get, addTask, updateTask, setEditing } = useTasks()

const editingPayload = computed(() => {
  if (!editingId.value) return null
  const data = get(editingId.value)
  return data ? { id: editingId.value, data } : null
})

function onSubmit(payload: { id?: string; data: any }) {
  if (payload.id) {
    updateTask(payload.id, payload.data)
    setEditing(null)
  } else {
    addTask(payload.data)
  }
}

function onCancelEdit() {
  setEditing(null)
}
</script>
