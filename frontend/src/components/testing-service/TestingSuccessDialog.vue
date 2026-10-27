<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  open: Boolean,
})

const emit = defineEmits(['close', 'requestReset'])
const closeButton = ref(null)
const continueButton = ref(null)
const resetButton = ref(null)
let returnFocusElement = null

watch(
  () => props.open,
  async (open) => {
    if (open) {
      returnFocusElement = document.activeElement
      await nextTick()
      closeButton.value?.focus()
      return
    }

    await nextTick()
    returnFocusElement?.focus?.()
    returnFocusElement = null
  },
)

function closeDialog() {
  emit('close')
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeDialog()
    return
  }

  if (event.key !== 'Tab') return

  const focusable = [closeButton.value, continueButton.value, resetButton.value].filter(Boolean)
  const currentIndex = focusable.indexOf(document.activeElement)
  const nextIndex = event.shiftKey
    ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
    : (currentIndex === focusable.length - 1 ? 0 : currentIndex + 1)

  event.preventDefault()
  focusable[nextIndex]?.focus()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="props.open" class="success-dialog__backdrop">
      <section
        class="success-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="testing-success-title"
        aria-describedby="testing-success-description"
        @keydown="handleKeydown"
      >
        <button
          ref="closeButton"
          class="success-dialog__close"
          type="button"
          aria-label="关闭成功提示"
          @click="closeDialog"
        >
          ×
        </button>
        <span class="success-dialog__icon" aria-hidden="true">✓</span>
        <p class="success-dialog__eyebrow">FRONT-END VALIDATION COMPLETE</p>
        <h2 id="testing-success-title">表单验证已完成</h2>
        <p id="testing-success-description">
          当前为前端演示，所填写的信息未发送、未上传、未保存。
        </p>
        <div class="success-dialog__actions">
          <button ref="continueButton" type="button" @click="closeDialog">继续编辑</button>
          <button ref="resetButton" type="button" class="success-dialog__reset" @click="emit('requestReset')">重置表单</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.success-dialog__backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 36, 72, 0.54);
}

.success-dialog {
  position: relative;
  width: min(470px, 100%);
  padding: 30px;
  border: 1px solid #b9dce9;
  border-radius: 10px;
  color: #345360;
  background: white;
  box-shadow: 0 24px 70px rgba(0, 44, 86, 0.3);
  text-align: center;
}

.success-dialog__close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  color: #57717d;
  background: #f1f6f8;
  font-size: 24px;
  cursor: pointer;
}

.success-dialog__icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  margin: 4px auto 16px;
  border: 1px solid #78b7c7;
  border-radius: 50%;
  color: #167da4;
  background: #eef7f9;
  font-size: 23px;
  font-weight: 700;
}

.success-dialog__eyebrow {
  color: #1482af !important;
  font-size: 11px !important;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.success-dialog h2 {
  margin-top: 6px;
  color: #19485b;
  font-size: 24px;
}

.success-dialog > p:not(.success-dialog__eyebrow) {
  margin-top: 12px;
  color: #647b86;
  font-size: 14px;
  line-height: 1.7;
}

.success-dialog__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 23px;
}

.success-dialog__actions button {
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #087fbe;
  border-radius: 5px;
  color: white;
  background: #087fbe;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.success-dialog__actions .success-dialog__reset {
  color: #316174;
  background: white;
  border-color: #a9cad7;
}

@media (max-width: 480px) {
  .success-dialog {
    padding: 27px 20px 22px;
  }

  .success-dialog__actions {
    grid-template-columns: 1fr;
  }
}
</style>
