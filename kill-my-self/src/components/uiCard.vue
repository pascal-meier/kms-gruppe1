<template>
  <section class="card" :class="$attrs.class">
    <header class="card-header">
      <span class="card-icon" v-if="icon">{{ icon }}</span>
      <div class="card-titles">
        <h3 class="card-title">{{ title }}</h3>
        <p class="card-subtitle">{{ subtitle }}</p>
      </div>
    </header>
    <div class="card-content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps({
  title: String,
  subtitle: String,
  icon: String,
});
</script>

<style scoped>
/* Optional, an deine globalen Variablen anpassen */
.card-content {
  padding: 1rem 0 0 0;
}
</style>
