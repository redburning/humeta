<script setup>
import TrajectoryCard from './TrajectoryCard.vue'
const props = defineProps({ trajectories: { type: Array, required: true } })
</script>
<template><div class="trajectory-grid"><TrajectoryCard v-for="item in props.trajectories" :key="item.id" :trajectory="item" /></div></template>
<style scoped>.trajectory-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: stretch; } @media (max-width: 700px) { .trajectory-grid { grid-template-columns: 1fr; } }</style>

