<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  value: { type: [String, Number, Array], default: '' },
  copyable: { type: Boolean, default: false },
  copyLabel: { type: String, default: 'value' },
})

const copyState = ref('idle')
let resetTimer

const displayValue = computed(() => (
  Array.isArray(props.value)
    ? props.value.join(' · ')
    : String(props.value ?? '')
))

async function copyValue() {
  let copied = false

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(displayValue.value)
      copied = true
    }
  } catch {
    copied = false
  }

  if (!copied) {
    const textarea = document.createElement('textarea')
    textarea.value = displayValue.value
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      copied = typeof document.execCommand === 'function' && document.execCommand('copy')
    } finally {
      textarea.remove()
    }
  }

  copyState.value = copied ? 'copied' : 'failed'

  window.clearTimeout(resetTimer)
  resetTimer = window.setTimeout(() => {
    copyState.value = 'idle'
  }, 1600)
}

onBeforeUnmount(() => window.clearTimeout(resetTimer))
</script>

<template>
  <span class="detail-field-value">
    <span class="detail-field-value__text" :title="displayValue">{{ displayValue }}</span>
    <button
      v-if="props.copyable"
      type="button"
      class="detail-field-value__copy"
      :class="{ 'is-copied': copyState === 'copied', 'is-failed': copyState === 'failed' }"
      :aria-label="copyState === 'copied' ? `${props.copyLabel} copied` : copyState === 'failed' ? `${props.copyLabel} copy failed` : `Copy ${props.copyLabel}`"
      :title="copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : `Copy ${props.copyLabel}`"
      @click="copyValue"
    >
      <svg viewBox="0 0 18 18" aria-hidden="true">
        <rect x="6.2" y="5.8" width="8.2" height="8.2" rx="1.2" />
        <path d="M4.2 11.8H3.7a1.2 1.2 0 0 1-1.2-1.2V3.7a1.2 1.2 0 0 1 1.2-1.2h6.9a1.2 1.2 0 0 1 1.2 1.2v.5" />
        <path v-if="copyState === 'copied'" d="m8.1 9.9 1.4 1.4 2.8-3" />
      </svg>
    </button>
    <span class="detail-field-value__status" aria-live="polite">
      {{ copyState === 'copied' ? `${props.copyLabel} copied` : copyState === 'failed' ? `${props.copyLabel} copy failed` : '' }}
    </span>
  </span>
</template>

<style scoped>
.detail-field-value {
  min-width: 0;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-field-value__text {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-field-value__copy {
  width: 25px;
  height: 25px;
  padding: 0;
  border: 1px solid #c7d9e2;
  border-radius: 3px;
  flex: 0 0 25px;
  display: grid;
  place-items: center;
  color: #5b7c90;
  background: #fbfdff;
  cursor: pointer;
}

.detail-field-value__copy:hover,
.detail-field-value__copy:focus-visible {
  border-color: #78adca;
  color: #087fbe;
  background: #eef7fb;
}

.detail-field-value__copy:focus-visible {
  outline: 2px solid rgba(8, 127, 190, 0.22);
  outline-offset: 2px;
}

.detail-field-value__copy.is-copied {
  border-color: #77a98f;
  color: #337b58;
  background: #f1f8f4;
}

.detail-field-value__copy.is-failed {
  border-color: #d5a1a1;
  color: #9c4848;
  background: #fff8f8;
}

.detail-field-value__copy svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.detail-field-value__status {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
