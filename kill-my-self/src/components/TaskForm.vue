<template>
  <form @submit.prevent="onSubmit" class="form">
    <h2 class="h">{{ isEdit ? 'Aufgabe bearbeiten' : 'Neue Aufgabe' }}</h2>

    <label class="row">
      <span>Titel*</span>
      <input v-model="title" required placeholder="z.B. Wäsche waschen" />
    </label>

    <label class="row">
      <span>Beschreibung</span>
      <textarea v-model="description" rows="3" placeholder="Optional"></textarea>
    </label>

    <label class="row">
      <span>Priorität</span>
      <select v-model="priorityId">
        <option :value="null">– keine –</option>
        <option v-for="p in priorities" :key="p.id" :value="p.id">
          {{ p.name }}
        </option>
      </select>
    </label>

    <div class="actions">
      <button type="submit">{{ isEdit ? 'Speichern' : 'Anlegen' }}</button>
      <button v-if="isEdit" type="button" class="ghost" @click="$emit('cancel')">Abbrechen</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, watch, ref } from "vue";
import type { ID, Task } from "../composable/useTasks.ts";
import { usePriorities } from "../composable/usePriorities.ts";

const { list: priorities } = usePriorities();

const props = defineProps<{ modelValue?: { id: ID; data: Task } | null }>();
const emit = defineEmits<{
  (e: "submit", payload: { id?: ID; data: { title: string; description?: string; priorityId?: ID | null } }): void;
  (e: "cancel"): void;
}>();

const isEdit = computed(() => !!props.modelValue);

const title = ref("");
const description = ref("");
const priorityId = ref<ID | null>(null);

watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        title.value = val.data.title ?? "";
        description.value = val.data.description ?? "";
        priorityId.value = val.data.priorityId ?? null;
      } else {
        title.value = "";
        description.value = "";
        priorityId.value = null;
      }
    },
    { immediate: true }
);

function onSubmit() {
  const payload = {
    data: { title: title.value, description: description.value, priorityId: priorityId.value }
  } as { id?: ID; data: { title: string; description?: string; priorityId?: ID | null } };

  if (isEdit.value && props.modelValue) payload.id = props.modelValue.id;
  emit("submit", payload);
}
</script>

<style scoped>
.form { display: grid; gap: .75rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: .75rem; }
.h { margin: 0 0 .25rem; font-size: 1.1rem; }
.row { display: grid; gap: .25rem; }
.row > span { font-size: .9rem; color: #444; }
.actions { display: flex; gap: .5rem; }
button { padding: .5rem .8rem; border-radius: .5rem; border: 1px solid #d1d5db; background: #111827; color: #fff; }
button.ghost { background: transparent; color: #111827; }
input, textarea, select { padding: .5rem .6rem; border: 1px solid #d1d5db; border-radius: .5rem; }
</style>
