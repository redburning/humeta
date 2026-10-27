<script setup>
const items = ['Metabolite1', 'Metabolite2', 'Metabolite3', 'Metabolite3']
</script>

<template>
  <nav class="category-nav" aria-label="Research categories">
    <div class="category-nav__inner">
      <span
        v-for="(item, index) in items"
        :key="`${item}-${index}`"
        class="category-nav__item"
        :class="{ 'category-nav__item--active': index === 0 }"
        :aria-current="index === 0 ? 'page' : undefined"
      >
        {{ item }}
      </span>
    </div>
  </nav>
</template>

<style scoped>
.category-nav {
  height: 42px;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.74);
  background: var(--deep-blue, #004f98);
  font-family: Arial, "Microsoft YaHei", "微软雅黑", sans-serif;
}

.category-nav__inner {
  width: min(1360px, calc(100% - 48px));
  height: 100%;
  margin-inline: auto;
  overflow-x: auto;
  display: flex;
  align-items: stretch;
  gap: 6px;
  scrollbar-width: none;
}

.category-nav__inner::-webkit-scrollbar {
  display: none;
}

.category-nav__item {
  position: relative;
  flex: 0 0 auto;
  padding: 0 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.74);
  background: transparent;
  font-size: 13.5px;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
}

.category-nav__item:hover {
  color: rgba(255, 255, 255, 0.94);
}

.category-nav__item--active {
  color: #fff;
  background: transparent;
  font-weight: 600;
}

.category-nav__item--active::after {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: calc(100% - 48px);
  min-width: 32px;
  height: 3px;
  background: #81d8f2;
  content: '';
  transform: translateX(-50%);
}

@media (max-width: 767px) {
  .category-nav__inner {
    width: 100%;
    padding-inline: 10px;
    box-sizing: border-box;
    gap: 4px;
  }

  .category-nav__item {
    padding-inline: 16px;
  }

  .category-nav__item--active::after { width: calc(100% - 40px); }
}
</style>

