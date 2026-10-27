<script setup>
const props = defineProps({ id: { type: String, required: true } })
</script>

<template>
  <nav class="detail-breadcrumb" aria-label="Breadcrumb">
    <RouterLink to="/">Home</RouterLink>
    <span aria-hidden="true">/</span>
    <RouterLink to="/browser">Browser</RouterLink>
    <span aria-hidden="true">/</span>
    <span aria-current="page">{{ props.id }}</span>
  </nav>
</template>

<style scoped>
.detail-breadcrumb {
  width: min(1360px, calc(100% - 48px));
  min-height: 34px;
  margin-inline: auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  color: #82919b;
  font-size: 11px;
}

.detail-breadcrumb a {
  color: #5f7888;
  text-decoration: none;
}

.detail-breadcrumb a:hover {
  color: #087fbe;
}

@media (max-width: 767px) {
  .detail-breadcrumb {
    width: calc(100% - 28px);
  }
}
</style>

