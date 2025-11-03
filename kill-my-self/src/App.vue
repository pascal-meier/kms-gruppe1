<template>
  <div class="app">
    <h1>📝 KMS ToDo App</h1>

    <div class="cards">
      <div class="card">
      </div>

      <div class="card">
        <Prio />
      </div>

      <div class="card">
        <todo-list />
      </div>
    </div>
  </div>
</template>

<script setup>
import todoList from "./components/TodoList.vue";
import Prio from './components/Prio.vue'
</script>

<style scoped>
.app {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  padding: 2rem;
  max-width: 1000px;
  margin: auto;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

/* 🧱 Karten-Container */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* 📦 einzelne Karte */
.card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

/* 🩶 dunkler Hintergrund */
body {
  background: #f5f7fa;
}
</style>
