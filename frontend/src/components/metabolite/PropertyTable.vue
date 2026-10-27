<script setup>
import { formatDetailLabel } from '../../utils/detailFieldPresentation'
import DetailFieldValue from './DetailFieldValue.vue'

const props = defineProps({
  fields: { type: Array, required: true },
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <dl class="property-table" :class="{ 'property-table--compact': props.compact }">
    <div
      v-for="field in props.fields"
      :key="field.label"
      class="property-table__row"
      :class="{ 'property-table__row--wide': field.wide }"
    >
      <dt :title="formatDetailLabel(field.label)">{{ formatDetailLabel(field.label) }}</dt>
      <dd><DetailFieldValue :value="field.value" /></dd>
    </div>
  </dl>
</template>

<style scoped>
.property-table {
  min-width: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  border-top: 1px solid var(--detail-border, #dce8ef);
  border-left: 1px solid var(--detail-border, #dce8ef);
}

.property-table__row {
  min-width: 0;
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  min-height: 36px;
}

.property-table__row:first-child {
  box-sizing: border-box;
  min-height: 38px;
  border-left: 3px solid #087fbe;
}

.property-table__row--wide {
  grid-column: 1 / -1;
  grid-template-columns: 200px minmax(0, 1fr);
}

.property-table__row--wide :deep(.detail-field-value__text) {
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
  overflow-wrap: anywhere;
}

.property-table dt,
.property-table dd {
  min-width: 0;
  margin: 0;
  padding: 7px 10px;
  border-right: 1px solid var(--detail-border, #dce8ef);
  border-bottom: 1px solid var(--detail-border, #dce8ef);
  display: flex;
  align-items: center;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.property-table dt {
  color: #6c8594;
  background: #f5f9fb;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
}

.property-table dd {
  color: #16324f;
  background: #fff;
  font-size: 15px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.property-table__row:first-child dt {
  padding-left: 12px;
  color: #718899;
  background: #eef6fa;
}

.property-table__row:first-child dd {
  color: #16324f;
  background: #fbfdfe;
  font-size: 16px;
  font-weight: 600;
}

.property-table--compact .property-table__row {
  min-height: 28px;
}

.property-table--compact dt,
.property-table--compact dd {
  padding: 3px 8px;
  line-height: 1.35;
}

.property-table--compact dt {
  font-size: var(--detail-font-field-label, 12px);
}

.property-table--compact dd {
  font-size: var(--detail-font-field-value, 14px);
}

@media (max-width: 1100px) {
  .property-table {
    grid-template-columns: 1fr;
  }

  .property-table__row {
    grid-template-columns: 200px minmax(0, 1fr);
  }

  .property-table__row--wide {
    grid-template-columns: 200px minmax(0, 1fr);
  }
}
</style>

