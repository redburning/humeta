<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  removable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select', 'remove'])

const rootElement = computed(() => (props.removable ? 'span' : 'button'))
const isLong = computed(() => props.value.length > 32)

function handleSelect(event) {
  if (props.removable) return
  event.stopPropagation()
  emit('select')
}
</script>

<template>
  <component
    :is="rootElement"
    class="search-token"
    :class="{ 'is-long': isLong, 'is-removable': props.removable }"
    :type="props.removable ? undefined : 'button'"
    :title="props.value"
    @click="handleSelect"
  >
    <span class="search-token__value">{{ props.value }}</span>
    <button
      v-if="props.removable"
      type="button"
      class="search-token__remove"
      :aria-label="`Remove ${props.value}`"
      @click.stop="emit('remove')"
    >
      ×
    </button>
  </component>
</template>

<style scoped>
.search-token {
  box-sizing: border-box;
  flex: 0 0 auto;
  width: auto;
  height: 32px;
  min-height: 32px;
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0 14px;
  overflow: hidden;
  border: 1px solid rgba(8, 127, 190, 0.18);
  border-radius: 16px;
  color: #24516b;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  text-align: left;
  white-space: nowrap;
  transition:
    border-color 90ms ease,
    color 90ms ease,
    background-color 90ms ease;
}

button.search-token {
  cursor: pointer;
}

button.search-token:hover,
button.search-token:focus-visible {
  border-color: #087fbe;
  color: #087fbe;
  background: #fff;
}

.search-token.is-long:not(.is-removable) {
  height: auto;
  min-height: 32px;
  padding: 8px 14px;
  line-height: 1.35;
  white-space: normal;
}

.search-token.is-removable {
  height: 36px;
  min-height: 36px;
  gap: 6px;
}

.search-token.is-removable.is-long {
  max-width: none;
  white-space: nowrap;
}

.search-token__value {
  min-width: 0;
}

.search-token.is-long .search-token__value {
  overflow-wrap: anywhere;
}

.search-token__remove {
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  display: inline-grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: inherit;
  background: transparent;
  box-shadow: none;
  font: inherit;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  cursor: pointer;
  opacity: 0.72;
  transition:
    color 90ms ease,
    opacity 90ms ease;
}

.search-token__remove:hover,
.search-token__remove:focus-visible {
  color: #087fbe;
  background: transparent;
  opacity: 1;
}
</style>
