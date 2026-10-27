<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ScientificSectionIcon from '../icons/ScientificSectionIcon.vue'

const props = defineProps({
  items: { type: Array, required: true },
  activeId: { type: String, default: '' },
})
const emit = defineEmits(['navigate', 'mode-change'])
const manuallyCollapsed = ref(false)
const viewportCollapsed = ref(false)
const collapsed = computed(() => manuallyCollapsed.value || viewportCollapsed.value)
let mediaQuery

function handleViewportChange(event) {
  viewportCollapsed.value = event.matches
}

function toggleCollapsed() {
  manuallyCollapsed.value = !manuallyCollapsed.value
}

function navigate(id) {
  emit('navigate', id)
}

watch(collapsed, (value) => emit('mode-change', value), { immediate: true })

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 1100px)')
  viewportCollapsed.value = mediaQuery.matches
  mediaQuery.addEventListener?.('change', handleViewportChange)
})

onBeforeUnmount(() => mediaQuery?.removeEventListener?.('change', handleViewportChange))
</script>

<template>
  <aside class="contents-card" :class="{ 'is-collapsed': collapsed }">
    <header class="contents-card__header">
      <h2>CONTENTS</h2>
      <button
        type="button"
        class="contents-card__collapse"
        :aria-label="collapsed ? 'Expand page contents' : 'Collapse page contents'"
        :aria-expanded="!collapsed"
        aria-controls="detail-contents-list"
        @click="toggleCollapsed"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12.5 5-5 5 5 5" /></svg>
      </button>
    </header>

    <nav id="detail-contents-list" class="contents-card__nav" aria-label="Page contents">
      <template v-for="item in props.items" :key="item.id">
        <p v-if="item.group" class="contents-card__group">{{ item.group }}</p>
        <a
          :href="`#${item.id}`"
          :class="{ 'is-active': item.id === props.activeId }"
          :aria-label="collapsed ? item.label : undefined"
          :aria-current="item.id === props.activeId ? 'location' : undefined"
          :title="collapsed ? item.label : undefined"
          @click.prevent="navigate(item.id)"
        >
          <ScientificSectionIcon
            class="contents-card__item-icon"
            :name="item.icon"
            :size="22"
          />
          <span class="contents-card__label">{{ item.label }}</span>
        </a>
      </template>
    </nav>
  </aside>
</template>

<style scoped>
.contents-card {
  --contents-active-accent: var(--primary-blue, #087fbe);
  --contents-inactive-text: #657d89;
  --contents-inactive-icon: #5b7c99;
  --contents-hover-bg: #f3f8fa;
  position: sticky;
  top: 16px;
  align-self: start;
  width: 260px;
  border: 1px solid #dce8ef;
  border-radius: 6px;
  overflow: hidden;
  background: #fbfdff;
  box-shadow: none;
}

.contents-card.is-collapsed {
  width: 68px;
}

.contents-card__header {
  min-height: 48px;
  padding: 0 10px 0 16px;
  border-bottom: 1px solid #dce8ef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: #f7fafc;
}

.contents-card__header h2 {
  color: var(--detail-text-primary, #173a4d);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.contents-card__collapse {
  width: 40px;
  height: 40px;
  padding: 11px;
  border: 1px solid #d2dee1;
  border-radius: 5px;
  display: grid;
  place-items: center;
  color: #54707b;
  background: #fff;
  cursor: pointer;
}

.contents-card__collapse:hover,
.contents-card__collapse:focus-visible {
  border-color: #90b6c4;
  color: #245f78;
  background: #f5fafb;
}

.contents-card__collapse svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.contents-card.is-collapsed .contents-card__header {
  padding-inline: 14px;
}

.contents-card.is-collapsed .contents-card__header h2 {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.contents-card.is-collapsed .contents-card__collapse svg {
  transform: rotate(180deg);
}

.contents-card__group {
  margin: 0;
  padding: 13px 16px 5px;
  color: var(--detail-text-muted, #80939d);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.contents-card__group:not(:first-child) {
  padding-top: 17px;
}

.contents-card__nav a {
  position: relative;
  min-height: 40px;
  margin: 2px 8px;
  padding: 7px 10px;
  display: flex;
  align-items: center;
  gap: 11px;
  border-radius: 5px;
  color: var(--contents-inactive-text);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  text-decoration: none;
  transition: none !important;
}

.contents-card__nav a:last-child {
  margin-bottom: 10px;
}

.contents-card__nav a:hover {
  color: #315c73;
  background: var(--contents-hover-bg);
}

.contents-card__nav a:hover .contents-card__item-icon {
  color: #3f7393;
}

.contents-card__nav a.is-active {
  color: #0e5c85;
  background: #e8f5fb;
  font-weight: 600;
}

.contents-card__nav a.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: var(--contents-active-accent);
}

.contents-card__item-icon {
  flex: 0 0 auto;
  color: var(--contents-inactive-icon);
}

.contents-card__nav a.is-active .contents-card__item-icon {
  color: var(--contents-active-accent);
}

.contents-card__label {
  min-width: 0;
}

.contents-card.is-collapsed .contents-card__group {
  height: 9px;
  padding: 0;
  border-top: 1px solid #e2e9e8;
  color: transparent;
  font-size: 0;
}

.contents-card.is-collapsed .contents-card__nav a {
  width: 48px;
  min-height: 44px;
  margin: 3px auto;
  padding: 10px;
  justify-content: center;
}

.contents-card.is-collapsed .contents-card__label {
  display: none;
}

@media (min-width: 901px) and (max-width: 1100px) {
  .contents-card__collapse {
    visibility: hidden;
  }
}

@media (max-width: 900px) {
  .contents-card,
  .contents-card.is-collapsed {
    position: sticky;
    z-index: 8;
    top: 8px;
    width: 100%;
    overflow: visible;
    border-radius: 6px;
  }

  .contents-card__header,
  .contents-card__group {
    display: none;
  }

  .contents-card__nav {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    padding: 5px 7px;
    display: grid;
    grid-template-columns: repeat(10, minmax(0, 1fr));
    align-items: center;
    gap: 0;
    overflow: hidden;
    border-radius: inherit;
    background: #fbfdff;
  }

  .contents-card__nav a,
  .contents-card.is-collapsed .contents-card__nav a {
    width: auto;
    min-width: 0;
    min-height: 42px;
    margin: 0;
    padding: 9px 4px;
    justify-content: center;
  }

  .contents-card__label {
    display: none;
  }
}
</style>

