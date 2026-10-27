<script setup>
import { ref } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])
const tabElements = ref([])

function setTabElement(element, index) {
  if (element) tabElements.value[index] = element
}

function selectCategory(categoryId) {
  emit('update:modelValue', categoryId)
}

function handleKeydown(event, index) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    selectCategory(props.categories[index].id)
    tabElements.value[index]?.focus()
    return
  }

  let nextIndex = index
  if (event.key === 'ArrowRight') nextIndex = (index + 1) % props.categories.length
  else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + props.categories.length) % props.categories.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = props.categories.length - 1
  else return

  event.preventDefault()
  selectCategory(props.categories[nextIndex].id)
  tabElements.value[nextIndex]?.focus()
}
</script>

<template>
  <div class="category-tabs">
    <div class="category-tabs__list" role="tablist" aria-label="业务方向">
      <button
        v-for="(category, index) in props.categories"
        :id="`testing-category-tab-${category.id}`"
        :key="category.id"
        :ref="(element) => setTabElement(element, index)"
        class="category-tabs__tab"
        type="button"
        role="tab"
        aria-controls="testing-service-project-panel"
        :aria-selected="props.modelValue === category.id"
        :tabindex="props.modelValue === category.id ? 0 : -1"
        :class="{ 'category-tabs__tab--active': props.modelValue === category.id }"
        @click="selectCategory(category.id)"
        @keydown="handleKeydown($event, index)"
      >
        <strong>{{ category.label }}</strong>
        <span>{{ category.shortLabel }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.category-tabs {
  margin-top: 42px;
  border-top: 1px solid var(--testing-line, #d5e3e9);
  border-bottom: 1px solid var(--testing-line, #d5e3e9);
}

.category-tabs__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.category-tabs__tab {
  position: relative;
  min-height: 72px;
  display: grid;
  place-content: center;
  gap: 4px;
  padding: 12px 18px;
  border: 0;
  color: #526c78;
  background: transparent;
  text-align: center;
  cursor: pointer;
}

.category-tabs__tab::after {
  content: '';
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: -1px;
  height: 3px;
  background: transparent;
}

.category-tabs__tab:hover,
.category-tabs__tab:focus-visible {
  color: #176e94;
  background: #f3f9fa;
}

.category-tabs__tab--active {
  color: #0b6f9b;
  background: transparent;
}

.category-tabs__tab--active::after {
  background: #148fc4;
}

.category-tabs__tab strong {
  color: inherit;
  font-size: 16px;
}

.category-tabs__tab span {
  color: #758b95;
  font-size: 13px;
}

@media (max-width: 800px) {
  .category-tabs {
    margin-top: 30px;
    padding-inline: 0;
  }

  .category-tabs__list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .category-tabs__tab {
    min-height: 60px;
    place-content: center;
    padding-inline: 8px;
    text-align: center;
  }

  .category-tabs__tab::after {
    inset: auto 8px 0;
    width: auto;
    height: 2px;
  }

  .category-tabs__tab strong {
    font-size: 14px;
  }

  .category-tabs__tab span {
    display: none;
  }
}
</style>
