<script setup>
import ConcentrationCard from './ConcentrationCard.vue'
const props = defineProps({ concentrations: { type: Array, required: true } })
</script>

<template><div class="concentration-grid"><ConcentrationCard v-for="item in props.concentrations" :key="item.id" :concentration="item" /></div></template>
<style scoped>.concentration-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: stretch; } @media (max-width: 700px) { .concentration-grid { grid-template-columns: 1fr; } }</style>

