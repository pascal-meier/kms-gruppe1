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
      <select v-model.number="priority">
        <option v-for="p in prios" :key="p.key" :value="p.weight">{{ p.label }}</option>
      </select>
    </label>
    <div class="actions">
      <button type="submit">{{ isEdit ? 'Speichern' : 'Anlegen' }}</button>
      <button v-if="isEdit" type="button" class="ghost" @click="handleCancel">Abbrechen</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, watch, ref } from "vue";
import type { ID, Task } from "../composable/useTasks";

const props = defineProps<{
  modelValue?: { id: ID; data: Task } | null;
  prios: Array<{ key: string; label: string; weight: number }>;
  onSubmit: Function;
  onCancel: Function;
}>();

const isEdit = computed(() => !!props.modelValue);

const title = ref("");
const description = ref("");
const priority = ref<1 | 2 | 3>(2);

watch(() => props.modelValue, (val) => {
  if (val) {
    title.value = val.data.title ?? "";
    description.value = val.data.description ?? "";
    priority.value = val.data.priority ?? 2;
  } else {
    title.value = "";
    description.value = "";
    priority.value = 2;
  }
}, { immediate: true });

function onSubmit() {
  const payload = {
    data: {
      title: title.value,
      description: description.value,
      priority: priority.value,
    },
  } as { id?: ID; data: Pick<Task, "title" | "description" | "priority"> };

  if (isEdit.value && props.modelValue) payload.id = props.modelValue.id;
  props.onSubmit(payload);
}

function handleCancel() {
  props.onCancel();
}
</script>
