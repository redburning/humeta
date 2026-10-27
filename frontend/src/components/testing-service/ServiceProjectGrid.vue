<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  activeServiceId: {
    type: String,
    required: true,
  },
  category: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['select'])
const projectElements = ref([])

watch(
  () => props.category.id,
  () => {
    projectElements.value = []
  },
)

function setProjectElement(element, index) {
  if (element) projectElements.value[index] = element
}

function selectProject(serviceId, interactionSource = 'service-activation') {
  emit('select', serviceId, interactionSource)
}

function selectProjectFromMobile(event) {
  selectProject(event.target.value, 'service-activation')
}

function handleKeydown(event, index) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    selectProject(props.category.services[index].id, 'service-activation')
    return
  }

  let nextIndex = index
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    nextIndex = (index + 1) % props.category.services.length
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    nextIndex = (index - 1 + props.category.services.length) % props.category.services.length
  } else if (event.key === 'Home') {
    nextIndex = 0
  } else if (event.key === 'End') {
    nextIndex = props.category.services.length - 1
  } else {
    return
  }

  event.preventDefault()
  selectProject(props.category.services[nextIndex].id, 'service-navigation')
  projectElements.value[nextIndex]?.focus()
}
</script>

<template>
  <section
    id="testing-service-project-panel"
    class="project-list"
    role="tabpanel"
    :aria-labelledby="`testing-category-tab-${props.category.id}`"
  >
    <h3 class="visually-hidden">选择具体项目</h3>
    <label class="project-list__mobile-label" for="testing-service-mobile-select">选择具体项目</label>
    <select
      id="testing-service-mobile-select"
      class="project-list__mobile-select"
      :value="props.activeServiceId"
      @change="selectProjectFromMobile"
    >
      <option v-for="service in props.category.services" :key="service.id" :value="service.id">
        {{ service.title }}
      </option>
    </select>
    <div class="project-list__items" role="listbox" :aria-label="`${props.category.label}项目`">
      <button
        v-for="(service, index) in props.category.services"
        :key="service.id"
        :ref="(element) => setProjectElement(element, index)"
        class="project-list__item"
        type="button"
        role="option"
        :aria-selected="props.activeServiceId === service.id"
        :tabindex="props.activeServiceId === service.id ? 0 : -1"
        :class="{ 'project-list__item--active': props.activeServiceId === service.id }"
        @click="selectProject(service.id)"
        @keydown="handleKeydown($event, index)"
      >
        <strong>{{ service.title }}</strong>
        <span>{{ service.tags.slice(0, 2).join(' · ') }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.project-list {
  min-width: 0;
  border-right: 1px solid var(--testing-line, #d8e5ea);
  background: #f4f8f9;
}

.project-list__items {
  display: grid;
  gap: 0;
  padding: 18px 16px;
}

.project-list__mobile-label,
.project-list__mobile-select {
  display: none;
}

.project-list__item {
  position: relative;
  min-height: 68px;
  display: grid;
  align-content: center;
  gap: 6px;
  padding: 11px 14px 11px 18px;
  border: 0;
  border-radius: 0;
  border-bottom: 1px solid #dde8eb;
  color: #3f5e6b;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.project-list__item::before {
  content: '';
  position: absolute;
  inset: 13px auto 13px 0;
  width: 3px;
  border-radius: 2px;
  background: transparent;
}

.project-list__item:hover,
.project-list__item:focus-visible {
  background: #eaf4f6;
}

.project-list__item--active {
  background: #e5f4f9;
}

.project-list__item--active::before {
  background: #1088bc;
}

.project-list__item strong {
  color: #234b5c;
  font-size: 14.5px;
  line-height: 1.4;
}

.project-list__item--active strong {
  color: #076f9e;
  font-weight: 750;
}

.project-list__item span {
  overflow: hidden;
  color: #758a94;
  font-size: 12.5px;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 800px) {
  .project-list {
    border-right: 0;
    border-bottom: 1px solid var(--testing-line, #d8e5ea);
    background: #f8fbfc;
  }

  .project-list__items {
    display: none;
  }

  .project-list__mobile-label {
    display: block;
    padding: 12px 14px 7px;
    color: #3e5f6d;
    font-size: 14px;
    font-weight: 700;
  }

  .project-list__mobile-select {
    width: calc(100% - 28px);
    min-height: 48px;
    display: block;
    margin: 0 14px 13px;
    padding: 8px 36px 8px 11px;
    border: 1px solid #b8d3de;
    border-radius: 5px;
    color: #244d5e;
    background: white;
    font-size: 14px;
  }
}
</style>
