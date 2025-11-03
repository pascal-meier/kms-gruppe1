<script setup lang="ts">
import { ref, onMounted } from "vue";
import { GetAllTasks, type Task } from "../api/tasks";

const tasks = ref<Task[]>([]);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    tasks.value = await GetAllTasks();
  } catch (err: any) {
    error.value = err.message;
  }
});
</script>

<template>
  <div>
    <h2>Aufgaben</h2>
    <div v-if="error">{{ error }}</div>
    <ul v-else>
      <li v-for="task in tasks" :key="task.id">
        {{ task.title }} ({{ task.priority }})
        <span v-if="task.completed">✅</span>
        <span v-else>⏳</span>
      </li>
    </ul>
  </div>
</template>