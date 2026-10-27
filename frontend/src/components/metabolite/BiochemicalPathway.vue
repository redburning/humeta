<script setup>
import { ref } from 'vue'

const props = defineProps({ pathway: { type: Object, required: true } })
const dialogRef = ref(null)

function openDialog() {
  dialogRef.value?.showModal()
}

function closeDialog() {
  dialogRef.value?.close()
}
</script>

<template>
  <div class="pathway">
    <button type="button" class="pathway__preview" aria-label="Enlarge human tryptophan metabolism pathway" @click="openDialog">
      <img :src="props.pathway.image" alt="Human tryptophan metabolism pathway" loading="lazy" />
      <span>Click to enlarge</span>
    </button>
    <p>{{ props.pathway.description }}</p>

    <dialog ref="dialogRef" class="pathway__dialog" aria-labelledby="pathway-dialog-title">
      <div class="pathway__dialog-header">
        <h2 id="pathway-dialog-title">{{ props.pathway.title }}</h2>
        <button type="button" aria-label="Close pathway preview" @click="closeDialog">×</button>
      </div>
      <img :src="props.pathway.image" alt="Enlarged human tryptophan metabolism pathway" />
    </dialog>
  </div>
</template>

<style scoped>
:global(#biochemical-pathway > .detail-section__body) { padding-top: 12px; }
.pathway__preview { position: relative; width: 100%; min-height: 560px; padding: 16px; border: 1px solid var(--detail-border, #dce8ef); border-radius: 6px; display: grid; place-items: center; background: #fbfdfe; cursor: zoom-in; }
.pathway__preview img { width: 100%; height: 530px; object-fit: contain; }
.pathway__preview span { position: absolute; right: 9px; bottom: 8px; padding: 5px 8px; border-radius: 4px; color: #496574; background: rgba(237, 246, 249, 0.94); font-size: 12px; }
.pathway > p { margin-top: 10px; color: #718899; font-size: 11px; line-height: 1.6; }
.pathway__dialog { width: min(1180px, calc(100% - 40px)); max-width: none; max-height: calc(100vh - 40px); padding: 0; border: 1px solid #bdd1db; border-radius: 5px; background: #fff; }
.pathway__dialog::backdrop { background: rgba(8, 31, 47, 0.64); }
.pathway__dialog-header { position: sticky; top: 0; z-index: 2; min-height: 44px; padding: 7px 9px 7px 14px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #d9e4e9; background: #edf5f8; }
.pathway__dialog-header h2 { color: #334d59; font-size: 16px; font-weight: 600; }
.pathway__dialog-header button { width: 30px; height: 30px; border: 1px solid #bdd2dc; border-radius: 3px; color: #4e6c7c; background: #fff; font-size: 20px; cursor: pointer; }
.pathway__dialog > img { width: 100%; min-height: 600px; max-height: calc(100vh - 90px); padding: 20px; object-fit: contain; }
@media (max-width: 767px) { .pathway__preview { min-height: 280px; padding: 10px; } .pathway__preview img { height: 260px; } .pathway__dialog > img { min-height: 400px; padding: 8px; } }
</style>

