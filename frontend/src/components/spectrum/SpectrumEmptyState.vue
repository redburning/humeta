<script setup>
defineProps({
  title: { type: String, required: true },
  message: { type: String, required: true },
})
</script>

<template>
  <div class="empty-state">
    <span aria-hidden="true">⌁</span>
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
.empty-state { min-height: 190px; display: grid; place-content: center; justify-items: center; gap: 8px; padding: 28px; border: 1px dashed #c7dce6; border-radius: 6px; color: #6b808a; background: #fbfdfe; text-align: center; }
.empty-state > span { width: 38px; height: 38px; display: grid; place-items: center; border: 1px solid #91bdcf; border-radius: 50%; color: var(--primary-blue); font-size: 22px; }
.empty-state h3 { color: #395966; font-size: 14px; }
.empty-state p { max-width: 560px; color: #87979f; font-size: 11px; line-height: 1.55; }
</style>

