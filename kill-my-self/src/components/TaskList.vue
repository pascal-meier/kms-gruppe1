<template>
  <div>
    <ul class="list">
      <li v-for="[id, task] in entries" :key="id" class="row" :class="{ done: task.done }">
        <label class="check">
          <input type="checkbox" :checked="task.done" @change="toggle(id, task.done)" />
        </label>
        <div class="main">
          <div class="title">
            <strong>{{ task.title }}</strong>
            <span class="prio" :data-p="task.priority">P{{ task.priority }}</span>
          </div>
          <p v-if="task.description" class="desc">{{ task.description }}</p>
          <small class="meta">Zuletzt geändert: {{ new Date(task.updatedAt).toLocaleString() }}</small>
        </div>
        <div class="acts">
          <button @click="$emit('edit', id)">Bearbeiten</button>
          <button @click="deleteTask(id)" class="delete-btn">Löschen</button>
        </div>
      </li>
    </ul>

    <!-- Neuer Button alle Tasks löschen -->
    <button @click="clearAll" class="delete-all-btn">Alle Tasks löschen</button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['edit'])
import { useTasks } from "../composable/useTasks.ts";

const { entries, updateTask, removeTask, clearAllTasks } = useTasks();

function toggle(id: string, cur: boolean) {
  updateTask(id, { done: !cur });
}

function deleteTask(id: string) {
  if (confirm("Task wirklich löschen?")) {
    removeTask(id);
  }
}

function clearAll() {
  if (confirm("Willst du wirklich alle Tasks löschen?")) {
    clearAllTasks();
  }
}
</script>
