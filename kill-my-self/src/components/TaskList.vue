<template>
  <ul class="list">
    <li v-for="[id, task] in entries" :key="id" class="row" :class="{ done: task.done }">
      <label class="check">
        <input type="checkbox" :checked="task.done" @change="toggle(id, task.done)" />
      </label>
      <div class="main">
        <div class="title">
          <strong>{{ task.title }}</strong>
          <span v-if="prio(task)" class="prio" :style="{ background: prio(task)?.color }">
            {{ prio(task)?.name }}
          </span>
        </div>
        <p v-if="task.description" class="desc">{{ task.description }}</p>
        <small class="meta">Zuletzt geändert: {{ new Date(task.updatedAt).toLocaleString() }}</small>
      </div>
      <div class="acts">
        <button @click="edit(id)">Bearbeiten</button>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useTasks } from "../composable/useTasks";
import { usePriorities } from "../composable/usePriorities";
const { entries, updateTask, setEditing } = useTasks();
const { getById } = usePriorities();

function toggle(id: string, cur: boolean) {
  updateTask(id, { done: !cur });
}
function edit(id: string) {
  setEditing(id);
}
function prio(task: { priorityId?: string | null }) {
  return getById(task.priorityId ?? null);
}
</script>

<style scoped>
.list { display: grid; gap: .5rem; margin: 1rem 0; }
.row { display: grid; grid-template-columns: auto 1fr auto; gap: .75rem; align-items: start; padding: .75rem; border: 1px solid #e5e7eb; border-radius: .75rem; }
.row.done { opacity: .7; }
.check { display:flex; align-items:center; }
.title { display:flex; align-items:center; gap:.5rem; flex-wrap: wrap; }
.prio { font-size:.75rem; padding:.1rem .35rem; border:1px solid #d1d5db; border-radius:.35rem; }
.desc { margin:.25rem 0 0; }
.meta { color:#666; }
.acts button { padding:.35rem .6rem; border-radius:.5rem; border:1px solid #d1d5db; background:#111827; color:#fff; }
</style>
