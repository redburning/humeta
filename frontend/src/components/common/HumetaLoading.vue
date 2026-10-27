<script setup>
import humetaLogo from '@/assets/images/brand/humeta-logo-dark.png'

const props = defineProps({
  label: {
    type: String,
    default: 'Loading',
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value),
  },
})
</script>

<template>
  <div
    class="humeta-loading"
    :class="`humeta-loading--${props.size}`"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <span class="humeta-loading__logo" aria-hidden="true">
      <img :src="humetaLogo" alt="" />
    </span>
    <span class="visually-hidden">{{ props.label }}</span>
  </div>
</template>

<style scoped>
.humeta-loading {
  --humeta-loading-logo-width: 118px;
  width: 100%;
  display: grid;
  place-items: center;
}

.humeta-loading--sm {
  --humeta-loading-logo-width: 102px;
}

.humeta-loading__logo {
  width: var(--humeta-loading-logo-width);
  overflow: hidden;
  display: block;
  clip-path: inset(0 100% 0 0);
  opacity: 0.25;
  will-change: clip-path, opacity;
  animation: humeta-loading-reveal 1.4s cubic-bezier(0.2, 0, 0, 1) infinite;
}

.humeta-loading__logo img {
  width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
}

@keyframes humeta-loading-reveal {
  0% {
    clip-path: inset(0 100% 0 0);
    opacity: 0.25;
  }

  55% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }

  80% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }

  100% {
    clip-path: inset(0 0 0 0);
    opacity: 0.35;
  }
}

@media (max-width: 767px) {
  .humeta-loading {
    --humeta-loading-logo-width: 92px;
  }

  .humeta-loading--sm {
    --humeta-loading-logo-width: 88px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .humeta-loading__logo {
    clip-path: inset(0 0 0 0);
    opacity: 1;
    animation: none;
  }
}
</style>
