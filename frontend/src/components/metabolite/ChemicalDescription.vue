<script setup>
import { formatDetailLabel } from '../../utils/detailFieldPresentation'
import DetailFieldValue from './DetailFieldValue.vue'

const props = defineProps({ description: { type: Object, required: true } })
</script>

<template>
  <div class="chemical-description">
    <dl class="chemical-description__fields">
      <div
        v-for="(row, rowIndex) in props.description.rows"
        :key="rowIndex"
        class="chemical-description__row"
        :class="{ 'chemical-description__row--wide': row.length === 1 }"
      >
        <template v-for="field in row" :key="field.label">
          <dt :title="formatDetailLabel(field.label)">{{ formatDetailLabel(field.label) }}</dt>
          <dd>
            <DetailFieldValue
              :value="field.value"
              :copyable="formatDetailLabel(field.label).toLowerCase() === 'smiles'"
              copy-label="SMILES"
            />
          </dd>
        </template>
      </div>
      <div class="chemical-description__row chemical-description__row--wide chemical-description__row--structure">
        <dt title="2D Structure">2D Structure</dt>
        <dd>
          <div class="chemical-description__image-wrap">
            <img :src="props.description.structureImage" :alt="props.description.structureAlt" loading="lazy" />
            <a :href="props.description.structureImage" :download="props.description.structureDownloadName">Download</a>
          </div>
        </dd>
      </div>
      <div class="chemical-description__row chemical-description__row--wide chemical-description__row--structure">
        <dt title="3D Structure">3D Structure</dt>
        <dd><div class="chemical-description__image-wrap"></div></dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.chemical-description { --chemical-description-label-width: 200px; --chemical-description-structure-content-height: 230px; --chemical-description-structure-image-height: 222px; min-width: 0; }
.chemical-description__fields { margin: 0; border-top: 1px solid var(--detail-border, #dce8ef); border-left: 1px solid var(--detail-border, #dce8ef); }
.chemical-description__row { min-width: 0; display: grid; grid-template-columns: var(--chemical-description-label-width) minmax(0, 1fr) var(--chemical-description-label-width) minmax(0, 1fr); }
.chemical-description__row--wide { grid-template-columns: var(--chemical-description-label-width) minmax(0, 1fr); }
.chemical-description dt, .chemical-description dd { min-width: 0; min-height: 32px; margin: 0; padding: 6px 9px; border-right: 1px solid var(--detail-border, #dce8ef); border-bottom: 1px solid var(--detail-border, #dce8ef); display: flex; align-items: center; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chemical-description dt { color: #718899; background: #f5f9fb; font-size: var(--detail-font-field-label, 12px); font-weight: 600; }
.chemical-description dd { color: #16324f; background: #fff; font-size: var(--detail-font-field-value, 14px); font-weight: 500; }
.chemical-description__row:has(> dt[title="SMILES"]) dd { padding-left: 9px; padding-right: 14px; }
.chemical-description__row--wide:not(.chemical-description__row--structure) dd { overflow: visible; text-overflow: clip; white-space: normal; }
.chemical-description__row--wide:not(.chemical-description__row--structure) :deep(.detail-field-value__text) { overflow: visible; text-overflow: clip; white-space: normal; overflow-wrap: anywhere; }
.chemical-description__row--structure { grid-template-columns: var(--chemical-description-label-width) minmax(0, 1fr); }
.chemical-description__row--structure dt { padding-top: 11px; align-items: flex-start; color: #718899; background: #eef6fa; font-size: var(--detail-font-field-label, 12px); }
.chemical-description__row--structure dd { min-height: var(--chemical-description-structure-content-height); padding: 0; }
.chemical-description__image-wrap { position: relative; width: 100%; min-height: var(--chemical-description-structure-content-height); padding: 4px 20px; display: grid; place-items: center; background: #fbfdfe; }
.chemical-description__image-wrap img { width: min(76%, 680px); height: var(--chemical-description-structure-image-height); object-fit: contain; }
.chemical-description__image-wrap a { position: absolute; right: 12px; bottom: 8px; min-height: 30px; padding: 6px 10px; border: 1px solid #bfd3da; border-radius: 4px; color: #356a7f; background: #f5f9fa; font-size: 12px; text-decoration: none; }
.chemical-description__image-wrap a:hover,
.chemical-description__image-wrap a:focus-visible { background: #eaf6fb; }
@media (max-width: 640px) {
  .chemical-description { --chemical-description-structure-content-height: 208px; --chemical-description-structure-image-height: 180px; }
  .chemical-description__row,
  .chemical-description__row--wide { grid-template-columns: var(--chemical-description-label-width) minmax(0, 1fr); }
  .chemical-description__row--structure dt { min-height: 32px; padding: 6px 9px; align-items: center; }
  .chemical-description__image-wrap { padding: 8px 10px 20px; }
  .chemical-description__image-wrap img { width: 100%; }
}
</style>

