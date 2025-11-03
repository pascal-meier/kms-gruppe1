<template>
  <div class="border p-3 rounded shadow-sm bg-white">
    <h2 class="font-semibold text-lg">{{ title }}</h2>
    <p class="text-gray-600 mb-1">{{ description }}</p>
    <p class="text-sm text-blue-600 font-medium">Priorität: {{ prio }}</p>
    <button
        @click="$emit('delete')"
        class="mt-2 bg-red-500 text-black px-3 py-1 rounded hover:bg-red-600"
    >
      Löschen
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  prio: String,
});
defineEmits(["delete"]);
</script>
