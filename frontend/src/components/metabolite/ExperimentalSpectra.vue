<script setup>
import SpectrumCard from './SpectrumCard.vue'

const props = defineProps({ spectra: { type: Object, required: true } })
</script>

<template>
  <div class="experimental-spectra">
    <SpectrumCard :spectrum="props.spectra.positive" />
    <SpectrumCard :spectrum="props.spectra.negative" />
  </div>
</template>

<style scoped>
.experimental-spectra { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: stretch; }
@media (max-width: 700px) { .experimental-spectra { grid-template-columns: 1fr; } }
</style>

