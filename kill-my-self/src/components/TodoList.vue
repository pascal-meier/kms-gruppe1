<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">📝 Meine To-Do-Liste</h1>

    <!-- Eingabeformular -->
    <form @submit.prevent="addTodo" class="space-y-2">
      <input
          v-model="newTitle"
          type="text"
          placeholder="Titel eingeben..."
          class="border p-2 w-full rounded"
          required
      />

      <textarea
          v-model="newDescription"
          placeholder="Beschreibung eingeben..."
          class="border p-2 w-full rounded"
      ></textarea>

      <!-- Prio-Auswahl -->
      <select
          v-model="selectedPrioKey"
          class="border p-2 w-full rounded"
          required
      >
        <option disabled value="">Priorität auswählen...</option>
        <option
            v-for="prio in priorities"
            :key="prio.key"
            :value="prio.key"
        >
          {{ prio.label }} ({{ prio.weight }})
        </option>
      </select>

      <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Hinzufügen
      </button>
    </form>

    <!-- To-Do-Liste -->
    <div v-if="todos.length" class="mt-6 space-y-3">
      <TodoItem
          v-for="(todo, index) in todos"
          :key="index"
          :title="todo.title"
          :description="todo.description"
          :prio="getPrioLabel(todo.prioKey)"
          @delete="removeTodo(index)"
      />
    </div>

    <p v-else class="text-gray-500 mt-4">Keine To-Dos vorhanden.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import TodoItem from "./TodoItem.vue";

// === LocalStorage Key für Prio-Komponente ===
const PRIOS_KEY = "priorities_csv";

// === CSV-Helfer (minimal) ===
function parseCSVLine(line) {
  const out = [];
  let cur = "", i = 0, inQuotes = false;
  while (i < line.length) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      cur += ch; i++; continue;
    } else {
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ",") { out.push(cur); cur = ""; i++; continue; }
      cur += ch; i++; continue;
    }
  }
  out.push(cur);
  return out;
}

function fromCSV(csv) {
  if (!csv.trim()) return { headers: [], rows: [] };
  const lines = csv.split(/\r?\n/);
  const headers = parseCSVLine(lines.shift());
  const rows = lines.filter(Boolean).map((line) => {
    const vals = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => (obj[h] = vals[i] ?? ""));
    return obj;
  });
  return { headers, rows };
}

// === State ===
const todos = ref([]);
const newTitle = ref("");
const newDescription = ref("");
const priorities = ref([]);
const selectedPrioKey = ref("");

// === Funktionen ===
function loadPriorities() {
  const csv = localStorage.getItem(PRIOS_KEY) || "";
  const { rows } = fromCSV(csv);
  priorities.value = rows.map((r) => ({
    key: r.key,
    label: r.label,
    weight: Number(r.weight),
  }));
}

function addTodo() {
  if (!newTitle.value.trim() || !selectedPrioKey.value) return;
  todos.value.push({
    title: newTitle.value,
    description: newDescription.value,
    prioKey: selectedPrioKey.value,
  });
  newTitle.value = "";
  newDescription.value = "";
  selectedPrioKey.value = "";
}

function removeTodo(index) {
  todos.value.splice(index, 1);
}

function getPrioLabel(key) {
  const p = priorities.value.find((p) => p.key === key);
  return p ? p.label : "Unbekannt";
}

// === Lifecycle ===
onMounted(() => {
  loadPriorities();
});
</script>
