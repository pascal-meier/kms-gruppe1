<template>
  <div class="prio">
    <h2>🧭 Prioritäten</h2>

    <form @submit.prevent="addPrio">
      <input v-model="newKey" placeholder="Key (z.B. high)" required />
      <input v-model="newLabel" placeholder="Label (z.B. Hoch)" required />
      <input v-model.number="newWeight" type="number" placeholder="Wert (1=hoch)" required />
      <button>Hinzufügen</button>
    </form>

    <ul>
      <li v-for="p in priorities" :key="p.key">
        <strong>{{ p.label }}</strong> ({{ p.key }}) – Gewichtung: {{ p.weight }}
        <button @click="deletePrio(p.key)">🗑️</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// === Lokale Storage Keys ===
const PRIOS_KEY = 'priorities_csv'
const PRIO_HEADERS = ['key','label','weight']

// === State ===
const priorities = ref([])
const newKey = ref('')
const newLabel = ref('')
const newWeight = ref(1)

// === CSV Helpers ===
function toCSV(rows, headers) {
  const esc = v => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const head = headers.join(',')
  const body = rows.map(r => headers.map(h => esc(r[h])).join(',')).join('\n')
  return [head, body].filter(Boolean).join('\n')
}

function parseCSVLine(line) {
  const out = []
  let cur = '', i = 0, inQuotes = false
  while (i < line.length) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i += 2; continue }
        inQuotes = false; i++; continue
      }
      cur += ch; i++; continue
    } else {
      if (ch === '"') { inQuotes = true; i++; continue }
      if (ch === ',') { out.push(cur); cur = ''; i++; continue }
      cur += ch; i++; continue
    }
  }
  out.push(cur)
  return out
}

function fromCSV(csv) {
  if (!csv.trim()) return { headers: [], rows: [] }
  const lines = csv.split(/\r?\n/)
  const headers = parseCSVLine(lines.shift())
  const rows = lines.filter(Boolean).map(line => {
    const vals = parseCSVLine(line)
    const obj = {}
    headers.forEach((h, i) => obj[h] = vals[i] ?? '')
    return obj
  })
  return { headers, rows }
}

// === Load/Save ===
function loadPriorities() {
  const csv = localStorage.getItem(PRIOS_KEY) || ''
  const { rows } = fromCSV(csv)
  priorities.value = rows.map(r => ({
    key: r.key,
    label: r.label,
    weight: Number(r.weight)
  }))
}

function savePriorities() {
  localStorage.setItem(PRIOS_KEY, toCSV(priorities.value, PRIO_HEADERS))
}

// === Functions ===
function addPrio() {
  priorities.value.push({
    key: newKey.value,
    label: newLabel.value,
    weight: newWeight.value
  })
  savePriorities()
  newKey.value = ''
  newLabel.value = ''
  newWeight.value = 1
}

function deletePrio(key) {
  priorities.value = priorities.value.filter(p => p.key !== key)
  savePriorities()
}

onMounted(loadPriorities)
</script>

<style scoped>
.prio {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: .5rem;
  max-width: 400px;
  color: #000; /* 👈 Text schwarz */
  background-color: #fff; /* optional für bessere Lesbarkeit */
}

form {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  margin-bottom: 1rem;
}

ul {
  list-style: none;
  padding: 0;
}

button {
  background: #eee;
  border: 1px solid #ccc;
  padding: .3rem .5rem;
  cursor: pointer;
  border-radius: .3rem;
  color: #000; /* 👈 Text im Button schwarz */
}

button:hover {
  background: #ddd;
}
</style>

