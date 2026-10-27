<script setup>
import darkLogo from '@/assets/images/brand/humeta-logo-dark.png'
import lightLogo from '@/assets/images/brand/humeta-logo-light.png'

const props = defineProps({
  variant: {
    type: String,
    default: 'light',
    validator: (value) => ['light', 'dark'].includes(value),
  },
})
</script>

<template>
  <span class="brand-logo">
    <img :src="props.variant === 'dark' ? darkLogo : lightLogo" alt="" aria-hidden="true" />
  </span>
</template>

<style scoped>
.brand-logo {
  position: relative;
  display: block;
  overflow: hidden;
  background: transparent;
}

.brand-logo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}
</style>
