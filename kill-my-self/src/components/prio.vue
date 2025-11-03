<template>
  <UiCard
    title="Priorisierung"
    subtitle="Stufen verwalten & zuweisen"
    icon="⭐"
    class="prio"
  >
    <!-- Inhalt von prio.vue -->
    <h2>🧭 Prioritäten</h2>
    <form @submit.prevent="onAddPrio">
      <input v-model="newKey" placeholder="Key (z.B. high)" required />
      <input v-model="newLabel" placeholder="Label (z.B. Hoch)" required />
      <input v-model.number="newWeight" type="number" placeholder="Wert (1=hoch)" required />
      <button>Hinzufügen</button>
    </form>
    <ul>
      <li v-for="p in prios" :key="p.key">
        <strong>{{ p.label }}</strong> ({{ p.key }}) – Gewichtung: {{ p.weight }}
        <button @click="onDeletePrio(p.key)">🗑️</button>
      </li>
    </ul>
  </UiCard>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { usePrios } from '../composable/usePrios.ts'

const { prios, addPrio, deletePrio } = usePrios()

const newKey = ref('')
const newLabel = ref('')
const newWeight = ref(1)

function onAddPrio() {
  addPrio({
    key: newKey.value,
    label: newLabel.value,
    weight: newWeight.value,
  })
  newKey.value = ''
  newLabel.value = ''
  newWeight.value = 1
}

function onDeletePrio(key: string) {
  deletePrio(key)
}
</script>
