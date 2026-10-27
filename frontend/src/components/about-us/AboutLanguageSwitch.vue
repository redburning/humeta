<script setup>
defineProps({
  language: {
    type: String,
    required: true,
  },
  labels: {
    type: Object,
    required: true,
  },
})

defineEmits(['select'])
</script>

<template>
  <div class="language-switch" :aria-label="labels.ariaLabel" role="group">
    <button
      type="button"
      :class="{ 'language-switch__button--active': language === 'zh' }"
      :aria-pressed="language === 'zh'"
      @click="$emit('select', 'zh')"
    >
      {{ labels.chinese }}
    </button>
    <span aria-hidden="true">/</span>
    <button
      type="button"
      :class="{ 'language-switch__button--active': language === 'en' }"
      :aria-pressed="language === 'en'"
      @click="$emit('select', 'en')"
    >
      {{ labels.english }}
    </button>
  </div>
</template>

<style scoped>
.language-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9aa7af;
  font-size: 14px;
  white-space: nowrap;
}

.language-switch__button {
  appearance: none;
}

.language-switch button {
  min-height: 40px;
  padding: 7px 3px;
  border: 0;
  border-bottom: 1px solid transparent;
  color: #75858f;
  background: transparent;
  font: inherit;
  cursor: pointer;
  transition: border-color 160ms ease, color 160ms ease;
}

.language-switch button:hover,
.language-switch button:focus-visible,
.language-switch__button--active {
  border-bottom-color: #087fbe;
  color: #075d96;
}

.language-switch button:focus-visible {
  border-radius: 3px;
  outline: 2px solid rgba(8, 127, 190, 0.28);
  outline-offset: 2px;
}
</style>
