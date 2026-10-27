<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const modes = Object.freeze([
  { value: 'substructure', label: 'Substructure', hint: 'Find the drawn fragment in targets' },
  { value: 'exact', label: 'Exact structure', hint: 'Compare molecular constitution' },
  { value: 'similarity', label: 'Similarity', hint: 'Explore stable demonstration scores' },
])

const tabElements = ref([])

function setTabElement(element, index) {
  tabElements.value[index] = element
}

function moveToTab(index) {
  const targetMode = modes[index]
  if (!targetMode) return

  if (targetMode.value !== props.modelValue) {
    emit('update:modelValue', targetMode.value)
  }

  tabElements.value[index]?.focus()
}

function handleKeydown(event, currentIndex) {
  let targetIndex

  switch (event.key) {
    case 'ArrowRight':
      targetIndex = (currentIndex + 1) % modes.length
      break
    case 'ArrowLeft':
      targetIndex = (currentIndex - 1 + modes.length) % modes.length
      break
    case 'Home':
      targetIndex = 0
      break
    case 'End':
      targetIndex = modes.length - 1
      break
    default:
      return
  }

  event.preventDefault()
  moveToTab(targetIndex)
}
</script>

<template>
  <div class="mode-card">
    <div class="mode-tabs" role="tablist" aria-label="Structure search mode">
      <button
        v-for="(mode, index) in modes"
        :id="`structure-tab-${mode.value}`"
        :key="mode.value"
        :ref="(element) => setTabElement(element, index)"
        class="mode-tab"
        :class="{ 'mode-tab--active': modelValue === mode.value }"
        type="button"
        role="tab"
        :aria-controls="`structure-panel-${mode.value}`"
        :aria-selected="modelValue === mode.value"
        :tabindex="modelValue === mode.value ? 0 : -1"
        @click="emit('update:modelValue', mode.value)"
        @keydown="handleKeydown($event, index)"
      >
        <strong>{{ mode.label }}</strong>
        <span>{{ mode.hint }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.mode-card {
  min-width: 0;
  margin-bottom: 18px;
  border: 1px solid var(--structure-border, #d4e2e9);
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  box-shadow: none;
}

.mode-tabs {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.mode-tab {
  min-width: 0;
  min-height: 72px;
  padding: 12px 16px;
  border: 0;
  border-bottom: 2px solid transparent;
  color: #647b87;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.mode-tab + .mode-tab {
  border-left: 1px solid var(--structure-divider, #edf2f4);
}

.mode-tab strong,
.mode-tab span {
  display: block;
}

.mode-tab strong {
  color: #294b5b;
  font-size: 15px;
  font-weight: 600;
}

.mode-tab span {
  margin-top: 4px;
  color: #718690;
  font-size: 13px;
  line-height: 1.5;
}

.mode-tab:hover {
  background: #fafcfd;
}

.mode-tab--active {
  border-bottom-color: var(--humeta-brand-primary);
  background: #f5fafc;
}

.mode-tab--active strong {
  color: var(--humeta-brand-primary);
}

@media (max-width: 767px) {
  .mode-tabs {
    grid-template-columns: 1fr;
  }

  .mode-tab {
    min-height: 44px;
    padding: 12px 16px;
    border-bottom: 0;
    border-left: 2px solid transparent;
  }

  .mode-tab + .mode-tab {
    border-top: 1px solid var(--structure-divider, #edf2f4);
  }

  .mode-tab--active {
    border-left-color: var(--humeta-brand-primary);
  }
}
</style>
