<script setup>
const props = defineProps({
  name: {
    type: String,
    default: 'record',
    validator: (value) => [
      'record',
      'overview',
      'chemical',
      'taxonomy',
      'spectra',
      'tissue',
      'biofluid',
      'trajectory',
      'disease',
      'pathway',
    ].includes(value),
  },
  size: {
    type: [Number, String],
    default: 20,
  },
})
</script>

<template>
  <svg
    class="scientific-section-icon"
    :data-icon="props.name"
    viewBox="0 0 24 24"
    :width="props.size"
    :height="props.size"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <g v-if="props.name === 'record'">
      <path d="M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7" />
      <circle cx="9" cy="10" r="2" />
      <path d="M15 8h2M15 12h2M7 16h10" />
    </g>

    <g v-else-if="props.name === 'overview'">
      <path d="M3 12h4l3 8 4-16 3 8h4" />
    </g>

    <g v-else-if="props.name === 'chemical'">
      <path d="M9.2 3.2h5.6M10.3 3.2v5.3c0 .9-.3 1.7-.8 2.4l-2.3 3.2C5 17.2 7.2 20.8 10.4 20.8h3.2c3.2 0 5.4-3.6 3.2-6.7l-2.3-3.2c-.5-.7-.8-1.5-.8-2.4V3.2M8.3 15.2c2.2-.8 5.2-.8 7.4 0" />
    </g>

    <g v-else-if="props.name === 'taxonomy'">
      <circle cx="12" cy="4.5" r="1.5" />
      <circle cx="5.5" cy="18.8" r="1.35" />
      <circle cx="12" cy="18.8" r="1.35" />
      <circle cx="18.5" cy="18.8" r="1.35" />
      <path d="M12 6v4.2M5.5 10.2h13M5.5 10.2v7.25M12 10.2v7.25M18.5 10.2v7.25" />
    </g>

    <g v-else-if="props.name === 'spectra'">
      <path d="M3.5 19.5h17M5.5 18v-4.5M8.75 18V7M12 18v-7M15.25 18V4.5M18.5 18V9" />
    </g>

    <g v-else-if="props.name === 'tissue'">
      <path d="M5.5 5.5V9M3.9 9h3.2v5.5H3.9zM5.5 14.5V19" />
      <path d="M12 3.3V7M10.4 7h3.2v6H10.4zM12 13v7.7" />
      <path d="M18.5 6v4.5M16.9 10.5h3.2v5H16.9zM18.5 15.5v4" />
    </g>

    <g v-else-if="props.name === 'biofluid'">
      <path d="M7.502 19.423c2.602 2.105 6.395 2.105 8.996 0 2.602-2.105 3.262-5.708 1.566-8.546l-4.89-7.26a1.376 1.376 0 0 0-2.346 0l-4.893 7.26c-1.695 2.838-1.035 6.441 1.567 8.546" />
    </g>

    <g v-else-if="props.name === 'trajectory'">
      <path d="M4 19h16M4 15l4-6 4 2 4-5 4 4" />
    </g>

    <g v-else-if="props.name === 'disease'">
      <circle cx="12" cy="4" r="2.2" />
      <circle cx="4.8" cy="15.3" r="2.2" />
      <circle cx="19.2" cy="15.3" r="2.2" />
      <path d="M8.2 11.3v-.6a3 3 0 0 1 3-3h1.6a3 3 0 0 1 3 3v.6a1 1 0 0 1-1 1H9.2a1 1 0 0 1-1-1z" />
      <path d="M1 22.5v-.6a3 3 0 0 1 3-3h1.6a3 3 0 0 1 3 3v.6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1z" />
      <path d="M15.4 22.5v-.6a3 3 0 0 1 3-3H20a3 3 0 0 1 3 3v.6a1 1 0 0 1-1 1h-5.6a1 1 0 0 1-1-1z" />
      <path d="M12 12.3v2.4M12 14.7l-3.4 1.9M12 14.7l3.4 1.9" />
    </g>

    <g v-else-if="props.name === 'pathway'">
      <path d="M9 6h6M6 9v6M9 18h6M18 9v6" />
      <path fill="currentColor" d="M4.9 3.9h2.2a1 1 0 0 1 1 1v2.2a1 1 0 0 1-1 1H4.9a1 1 0 0 1-1-1V4.9a1 1 0 0 1 1-1z" />
      <path d="M16.9 3.9h2.2a1 1 0 0 1 1 1v2.2a1 1 0 0 1-1 1h-2.2a1 1 0 0 1-1-1V4.9a1 1 0 0 1 1-1z" />
      <path d="M4.9 15.9h2.2a1 1 0 0 1 1 1v2.2a1 1 0 0 1-1 1H4.9a1 1 0 0 1-1-1v-2.2a1 1 0 0 1 1-1z" />
      <path fill="currentColor" d="M16.9 15.9h2.2a1 1 0 0 1 1 1v2.2a1 1 0 0 1-1 1h-2.2a1 1 0 0 1-1-1v-2.2a1 1 0 0 1 1-1z" />
    </g>
  </svg>
</template>

<style scoped>
.scientific-section-icon {
  display: block;
  flex: 0 0 auto;
  overflow: visible;
}

.scientific-section-icon :where(path, circle, ellipse, line, polyline, polygon) {
  vector-effect: non-scaling-stroke;
}
</style>
