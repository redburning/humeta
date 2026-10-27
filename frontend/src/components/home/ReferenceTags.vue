<script setup>
defineEmits(['select'])

const tags = ['Metabolite1', 'Metabolite2', 'Metabolite3']
</script>

<template>
  <div class="reference-tags" aria-label="搜索参考词">
    <span>Reference:</span>
    <button v-for="tag in tags" :key="tag" type="button" @click="$emit('select', tag)">
      {{ tag }}
    </button>
  </div>
</template>

<style scoped>
.reference-tags {
  min-height: 34px;
  margin-top: 13px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  color: rgba(255, 255, 255, 0.61);
  font-size: 13.5px;
}

.reference-tags button {
  min-height: 29px;
  padding: 4px 14px;
  border: 1px solid rgba(220, 247, 255, 0.38);
  border-radius: 5px;
  color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.035);
  font: inherit;
  cursor: pointer;
  transition: color 180ms ease, background 180ms ease, border-color 180ms ease, transform 180ms ease;
}

.reference-tags button:hover,
.reference-tags button:focus-visible {
  border-color: rgba(255, 255, 255, 0.72);
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

@media (max-width: 767px) {
  .reference-tags {
    flex-wrap: wrap;
    justify-content: center;
    gap: 7px;
    margin-top: 12px;
    font-size: 11.5px;
  }

  .reference-tags button {
    min-height: 27px;
    padding-inline: 9px;
  }
}

@media (max-width: 350px) {
  .reference-tags span {
    flex-basis: 100%;
    text-align: center;
  }
}
</style>
