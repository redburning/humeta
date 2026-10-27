<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ScientificSectionIcon from '../icons/ScientificSectionIcon.vue'

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  icon: { type: String, default: 'record' },
  active: { type: Boolean, default: false },
  collapsible: { type: Boolean, default: true },
  fullscreenable: { type: Boolean, default: false },
})

const sectionRef = ref(null)
const collapsed = ref(false)
const fullscreenSupported = ref(false)
const isFullscreen = ref(false)
const titleId = computed(() => `${props.id}-title`)
const bodyId = computed(() => `${props.id}-content`)

function toggleCollapsed() {
  collapsed.value = !collapsed.value
}

async function toggleFullscreen() {
  const target = sectionRef.value
  if (!target?.requestFullscreen) return

  try {
    if (document.fullscreenElement === target) {
      await document.exitFullscreen()
    } else {
      await target.requestFullscreen()
    }
  } catch {
    handleFullscreenChange()
  }
}

function handleFullscreenChange() {
  isFullscreen.value = document.fullscreenElement === sectionRef.value
}

onMounted(() => {
  fullscreenSupported.value = Boolean(sectionRef.value?.requestFullscreen)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<template>
  <section
    :id="props.id"
    ref="sectionRef"
    class="detail-section"
    :class="{
      'detail-section--active': props.active,
      'detail-section--fullscreen': isFullscreen,
    }"
    :aria-labelledby="titleId"
  >
    <header class="detail-section__header">
      <div class="detail-section__title-wrap">
        <ScientificSectionIcon
          class="detail-section__icon"
          :name="props.icon"
          :size="18"
        />
        <h2 :id="titleId">{{ props.title }}</h2>
      </div>

      <div class="detail-section__actions">
        <button
          v-if="props.fullscreenable && fullscreenSupported"
          type="button"
          class="detail-section__action"
          :aria-label="isFullscreen ? `Exit ${props.title} fullscreen` : `View ${props.title} fullscreen`"
          @click="toggleFullscreen"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path v-if="!isFullscreen" d="M3 8V3h5M12 3h5v5M17 12v5h-5M8 17H3v-5" />
            <path v-else d="M8 3v5H3m14 0h-5V3m0 14v-5h5M3 12h5v5" />
          </svg>
        </button>
        <button
          v-if="props.collapsible"
          type="button"
          class="detail-section__action"
          :aria-label="collapsed ? `Expand ${props.title}` : `Collapse ${props.title}`"
          :aria-controls="bodyId"
          :aria-expanded="!collapsed"
          @click="toggleCollapsed"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" :class="{ 'is-collapsed': collapsed }">
            <path d="m5 8 5 5 5-5" />
          </svg>
        </button>
      </div>
    </header>

    <div :id="bodyId" v-show="!collapsed" class="detail-section__body">
      <slot :fullscreen="isFullscreen" />
    </div>
  </section>
</template>

<style scoped>
.detail-section {
  scroll-margin-top: 112px;
  overflow: hidden;
  border: 1px solid var(--detail-border, #dce8ef);
  border-radius: 6px;
  background: #fff;
}

.detail-section__header {
  box-sizing: border-box;
  height: 48px;
  min-height: 48px;
  padding: 3px 6px 3px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--detail-border, #dce8ef);
  background: #f8fbfd;
  box-shadow: inset 3px 0 var(--primary-blue, #087fbe);
}

.detail-section__title-wrap {
  display: flex;
  align-items: center;
  gap: 9px;
}

.detail-section__icon {
  flex: 0 0 auto;
  color: #6b879b;
}

.detail-section--active .detail-section__icon {
  color: var(--primary-blue, #087fbe);
}

.detail-section h2 {
  color: var(--detail-text-primary, #193b4d);
  font-size: var(--detail-font-section-title, 16px);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0;
}

.detail-section__actions {
  display: flex;
  align-items: center;
  gap: 3px;
}

.detail-section__action {
  width: 40px;
  height: 40px;
  padding: 9px;
  border: 1px solid transparent;
  border-radius: 3px;
  display: grid;
  place-items: center;
  color: #647d88;
  background: transparent;
  cursor: pointer;
}

.detail-section__action:hover,
.detail-section__action:focus-visible {
  border-color: #bfd1d7;
  color: #315f73;
  background: #fff;
}

.detail-section__action svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
  transition: transform 160ms ease;
}

.detail-section__action svg.is-collapsed {
  transform: rotate(-90deg);
}

.detail-section__body {
  min-width: 0;
  padding: 18px 20px;
}

.detail-section--fullscreen {
  width: 100vw;
  height: 100vh;
  border: 0;
  border-radius: 0;
  overflow: auto;
  background: #fff;
}

.detail-section--fullscreen .detail-section__header {
  position: sticky;
  z-index: 4;
  top: 0;
}

@media (max-width: 767px) {
  .detail-section {
    scroll-margin-top: 78px;
  }

  .detail-section__body {
    padding: 16px 14px;
  }

  .detail-section__header {
    height: 48px;
    min-height: 48px;
    padding-left: 13px;
  }

  .detail-section h2 {
    font-size: var(--detail-font-section-title, 16px);
  }
}
</style>

