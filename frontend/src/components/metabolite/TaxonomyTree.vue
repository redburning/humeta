<script setup>
import { computed, ref } from 'vue'
import TaxonomyNode from './TaxonomyNode.vue'
import { resolveHumetaCategory } from './taxonomyPalette.js'

const props = defineProps({
  trees: { type: Array, required: true },
})
const openTrees = ref(new Set(props.trees.map((tree) => tree.id)))
const expandedTrees = ref(new Set())
const maxVisibleRows = 5

const taxonomyTitles = Object.freeze({
  'np-classifier': 'Humeta Classification System',
  classifier: 'Classyfire System',
})

function countRows(node) {
  if (!node) return 0

  return 1 + (node.children || []).reduce((count, child) => count + countRows(child), 0)
}

function getHierarchyDepth(node) {
  if (!node) return 0

  return 1 + (node.children || []).reduce(
    (maxDepth, child) => Math.max(maxDepth, getHierarchyDepth(child)),
    0,
  )
}

function limitTree(node, remainingRows) {
  if (!node || remainingRows.value === 0) return null

  remainingRows.value -= 1
  const children = []

  for (const child of node.children || []) {
    const visibleChild = limitTree(child, remainingRows)
    if (!visibleChild) break
    children.push(visibleChild)
  }

  return { ...node, children }
}

function getLastNodeId(node) {
  if (!node?.children?.length) return node?.id
  return getLastNodeId(node.children[node.children.length - 1])
}

const displayTrees = computed(() => props.trees.map((tree) => {
  const totalRows = countRows(tree.tree)
  const totalDepth = getHierarchyDepth(tree.tree)
  const truncatedTree = limitTree(tree.tree, { value: maxVisibleRows })
  const hasOverflow = totalRows > maxVisibleRows
  const isExpanded = expandedTrees.value.has(tree.id)
  const system = tree.id === 'np-classifier' ? 'humeta' : 'classyfire'
  const category = system === 'humeta' ? resolveHumetaCategory(tree.tree?.label) : null

  return {
    ...tree,
    title: taxonomyTitles[tree.id] ?? tree.title,
    system,
    category,
    totalDepth,
    visibleTree: isExpanded ? tree.tree : truncatedTree,
    overflowNodeId: hasOverflow
      ? getLastNodeId(truncatedTree)
      : '',
    hasOverflow,
    isExpanded,
    bodyId: `taxonomy-tree-${tree.id}`,
  }
}))

function toggleTree(id) {
  const next = new Set(openTrees.value)
  next.has(id) ? next.delete(id) : next.add(id)
  openTrees.value = next
}

function toggleOverflow(id) {
  const next = new Set(expandedTrees.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expandedTrees.value = next
}
</script>

<template>
  <div class="taxonomy-trees">
    <article v-for="tree in displayTrees" :key="tree.id" class="taxonomy-tree">
      <button
        type="button"
        class="taxonomy-tree__toggle"
        :aria-controls="tree.bodyId"
        :aria-expanded="openTrees.has(tree.id)"
        @click="toggleTree(tree.id)"
      >
        <span>{{ tree.title }}</span>
        <svg viewBox="0 0 16 16" aria-hidden="true" :class="{ 'is-collapsed': !openTrees.has(tree.id) }"><path d="m4 6 4 4 4-4" /></svg>
      </button>
      <div :id="tree.bodyId" v-show="openTrees.has(tree.id)" class="taxonomy-tree__body">
        <ul v-if="tree.visibleTree">
          <TaxonomyNode
            :node="tree.visibleTree"
            :depth="1"
            :total-depth="tree.totalDepth"
            :system="tree.system"
            :category="tree.category"
            :overflow-node-id="tree.overflowNodeId"
            :overflow-expanded="tree.isExpanded"
            :overflow-controls="tree.bodyId"
            :overflow-tree-title="tree.title"
            :on-toggle-overflow="tree.hasOverflow ? () => toggleOverflow(tree.id) : null"
          />
        </ul>
      </div>
    </article>
  </div>
</template>

<style scoped>
.taxonomy-trees {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.taxonomy-tree {
  min-width: 0;
  border: 1px solid var(--detail-border, #dce8ef);
  border-radius: 6px;
  overflow: hidden;
  background: #f8fbfd;
}

.taxonomy-tree__toggle {
  width: 100%;
  min-height: 46px;
  padding: 10px 14px;
  border: 0;
  border-bottom: 1px solid var(--detail-border, #dce8ef);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #274f63;
  background: #f5f9fb;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.taxonomy-tree__toggle svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  transition: transform 160ms ease;
}

.taxonomy-tree__toggle svg.is-collapsed {
  transform: rotate(-90deg);
}

.taxonomy-tree__toggle:focus-visible {
  outline: 2px solid rgba(8, 127, 190, 0.42);
  outline-offset: -2px;
}

.taxonomy-tree__body {
  min-width: 0;
  padding: 14px;
  background: #fbfdfe;
}

.taxonomy-tree__body ul {
  margin: 0;
  padding: 0;
}

@media (max-width: 768px) {
  .taxonomy-trees {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .taxonomy-trees {
    grid-template-columns: 1fr;
  }
}
</style>

