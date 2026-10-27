<script setup>
defineProps({
  variant: { type: String, required: true },
})
</script>

<template>
  <svg
    class="banner-geometric-lines"
    :class="`banner-geometric-lines--${variant}`"
    viewBox="0 0 500 80"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <g v-if="variant === 'news'">
      <path d="M188 51H286L334 28H424" stroke="currentColor" />
      <path class="banner-geometric-lines__secondary" d="M353 63H408" stroke="currentColor" />
      <circle class="banner-geometric-lines__node" cx="286" cy="51" r="3" stroke="currentColor" />
    </g>

    <g v-else>
      <path d="M178 54H272L324 30H422" stroke="currentColor" />
      <path class="banner-geometric-lines__secondary" d="M349 64H404" stroke="currentColor" />
      <circle class="banner-geometric-lines__node" cx="272" cy="54" r="3" stroke="currentColor" />
    </g>
  </svg>
</template>

<style scoped>
.banner-geometric-lines {
  position: absolute;
  z-index: 1;
  top: 50%;
  right: max(4%, 24px);
  width: clamp(360px, 34vw, 500px);
  height: auto;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.22);
  pointer-events: none;
}

.banner-geometric-lines path,
.banner-geometric-lines circle {
  vector-effect: non-scaling-stroke;
  stroke-width: 1.25;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.banner-geometric-lines__secondary { opacity: 0.75; }

.banner-geometric-lines__node {
  color: rgba(255, 255, 255, 0.26);
}

@media (max-width: 768px) {
  .banner-geometric-lines {
    right: 24px;
    width: 260px;
  }

  .banner-geometric-lines__secondary { display: none; }
}

@media (max-width: 599px) {
  .banner-geometric-lines { display: none; }
}
</style>
