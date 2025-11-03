<template>
  <div class="prio">
    <form class="row" @submit.prevent="create">
      <input v-model="name" placeholder="Name (z.B. Hoch)" required />
      <input v-model="color" type="color" title="Farbe" />
      <input v-model.number="order" type="number" min="1" step="1" title="Reihenfolge" />
      <button type="submit">Anlegen</button>
    </form>

    <ul class="list">
      <li v-for="p in list" :key="p.id" class="item">
        <span class="swatch" :style="{ background: p.color }"></span>
        <input v-model="p.name" @change="save(p)" />
        <input v-model="p.color" @change="save(p)" />
        <input v-model.number="p.order" type="number" min="1" step="1" @change="save(p)" />
        <button class="ghost" @click="remove(p.id)">Löschen</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { usePriorities } from "../composable/usePriorities";
const { list, addPriority, updatePriority, removePriority } = usePriorities();

const name = ref("");
const color = ref("#e5e7eb");
const order = ref<number>( (list.value.at(-1)?.order ?? 2) + 1 );

function resetForm() {
  name.value = "";
  color.value = "#e5e7eb";
  order.value = (list.value.at(-1)?.order ?? 2) + 1;
}
function create() {
  addPriority({ name: name.value, color: color.value, order: order.value });
  resetForm();
}
function save(p: { id: string; name: string; color?: string; order: number }) {
  updatePriority(p.id, { name: p.name, color: p.color, order: p.order });
}
function remove(id: string) {
  removePriority(id);
}
</script>

<style scoped>
.prio { display:grid; gap:1rem; }
.row { display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; }
.list { display:grid; gap:.5rem; }
.item { display:grid; grid-template-columns: auto 1fr 120px 90px auto; gap:.5rem; align-items:center; }
.swatch { width:18px; height:18px; border:1px solid #d1d5db; border-radius:4px; }
input[type="color"] { padding:0; height:2rem; width:120px; }
button { padding:.4rem .6rem; border-radius:.5rem; border:1px solid #d1d5db; background:#111827; color:#fff; }
button.ghost { background:transparent; color:#111827; }
</style>
