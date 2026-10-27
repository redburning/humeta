<script setup>
import { computed } from 'vue'
import { getTaxonomyRankStyle } from './taxonomyPalette.js'

defineOptions({ name: 'TaxonomyNode' })

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 1 },
  totalDepth: { type: Number, default: 1 },
  system: { type: String, default: 'classyfire' },
  category: { type: String, default: null },
  overflowNodeId: { type: String, default: '' },
  overflowExpanded: { type: Boolean, default: false },
  overflowControls: { type: String, default: '' },
  overflowTreeTitle: { type: String, default: '' },
  onToggleOverflow: { type: Function, default: null },
})

const rankStyle = computed(() => getTaxonomyRankStyle({
  system: props.system,
  category: props.category,
  depth: props.depth,
  totalDepth: props.totalDepth,
}))
const isOverflowEndpoint = computed(() => props.overflowNodeId === props.node.id)
</script>

<template>
  <li class="taxonomy-node" :class="`taxonomy-node--${props.system}`">
    <span class="taxonomy-node__label" :class="{ 'has-overflow-toggle': isOverflowEndpoint && props.onToggleOverflow }" :title="`${props.node.rank ? `${props.node.rank}: ` : ''}${props.node.label}`">
      <span v-if="props.node.rank" class="taxonomy-node__rank" :style="{ '--taxonomy-rank-background': rankStyle.background, '--taxonomy-rank-color': rankStyle.color }">{{ props.node.rank }}</span>
      <span class="taxonomy-node__value-cell">
        <span class="taxonomy-node__value">{{ props.node.label }}</span>
        <button
          v-if="isOverflowEndpoint && props.onToggleOverflow"
          type="button"
          class="taxonomy-node__ellipsis"
          :aria-controls="props.overflowControls"
          :aria-expanded="props.overflowExpanded"
          :aria-label="`${props.overflowExpanded ? 'Collapse' : 'Expand full'} ${props.overflowTreeTitle}`"
          :title="props.overflowExpanded ? 'Collapse classification' : 'Expand full classification'"
          @click="props.onToggleOverflow"
        ><span aria-hidden="true">…</span></button>
      </span>
    </span>
    <ul v-if="props.node.children?.length" class="taxonomy-node__children">
      <TaxonomyNode v-for="child in props.node.children" :key="child.id" :node="child" :depth="props.depth + 1" :total-depth="props.totalDepth" :system="props.system" :category="props.category" :overflow-node-id="props.overflowNodeId" :overflow-expanded="props.overflowExpanded" :overflow-controls="props.overflowControls" :overflow-tree-title="props.overflowTreeTitle" :on-toggle-overflow="props.onToggleOverflow" />
    </ul>
  </li>
</template>

<style scoped>
.taxonomy-node {
  position: relative;
  list-style: none;
}

.taxonomy-node--humeta {
  --taxonomy-label-cell-width: 204px;
}

.taxonomy-node--classyfire {
  --taxonomy-label-cell-width: 100px;
}

.taxonomy-node__label {
  position: relative;
  z-index: 1;
  max-width: 100%;
  min-height: 30px;
  padding: 0;
  border: 1px solid #d4e2e8;
  border-left: 2px solid #a4c6d5;
  border-radius: 4px;
  width: 100%;
  display: grid;
  grid-template-columns: var(--taxonomy-label-cell-width) minmax(0, 1fr);
  align-items: stretch;
  gap: 0;
  color: #345d70;
  background: #fbfdfe;
  font-size: 12px;
  line-height: 1.4;
  overflow: hidden;
}

.taxonomy-node__rank {
  min-width: 0;
  padding: 8px 4px;
  border-radius: 0;
  display: flex;
  align-items: center;
  color: var(--taxonomy-rank-color, #3d6278);
  background: var(--taxonomy-rank-background);
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}

.taxonomy-node__value-cell {
  min-width: 0;
  padding: 0 9px 0 8px;
  display: flex;
  align-items: center;
  gap: 7px;
  background: #fbfdfe;
}

.taxonomy-node__value {
  min-width: 0;
  color: #284f62;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.taxonomy-node__ellipsis {
  position: relative;
  flex: 0 0 26px;
  width: 26px;
  height: 19px;
  margin-left: auto;
  padding: 0;
  border: 1px solid #d7e7f0;
  border-radius: 5px;
  display: inline-grid;
  place-items: center;
  color: #5d7a8c;
  background: #edf6fa;
  font: inherit;
  cursor: pointer;
}

.taxonomy-node__ellipsis > span {
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
}

.taxonomy-node__ellipsis::before {
  content: '';
  position: absolute;
  inset: -4px -3px;
}

.taxonomy-node__ellipsis:focus-visible {
  outline: 2px solid rgba(8, 127, 190, 0.42);
  outline-offset: 1px;
}

.taxonomy-node__children {
  position: relative;
  min-width: 0;
  margin: 7px 0 0 20px;
  padding-left: 24px;
}

.taxonomy-node__children::before {
  content: '';
  position: absolute;
  left: 0;
  top: -7px;
  bottom: 14px;
  border-left: 1px solid #ccdce3;
}

.taxonomy-node__children > :deep(.taxonomy-node)::before {
  content: '';
  position: absolute;
  left: -24px;
  top: 14px;
  width: 24px;
  border-top: 1px solid #ccdce3;
}

@media (max-width: 700px) {
  .taxonomy-node__label {
    grid-template-columns: max-content minmax(0, 1fr);
  }

  .taxonomy-node__children {
    margin-left: 12px;
    padding-left: 16px;
  }

  .taxonomy-node__children > :deep(.taxonomy-node)::before {
    left: -16px;
    width: 16px;
  }
}
</style>

