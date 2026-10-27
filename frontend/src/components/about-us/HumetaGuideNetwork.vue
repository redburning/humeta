<script setup>
import { computed, ref } from 'vue'
import AboutEChart from './AboutEChart.vue'

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
})

const groupStyles = Object.freeze({
  identity: { color: '#e8f4f8', borderColor: '#62abc4', textColor: '#205f72', lineColor: '#82bed0' },
  evidence: { color: '#e3f4ef', borderColor: '#56ad97', textColor: '#256c5e', lineColor: '#7cc2b0' },
  context: { color: '#eef0f9', borderColor: '#879ac9', textColor: '#4c5f8d', lineColor: '#a3afd2' },
  standards: { color: '#f0f5e8', borderColor: '#91b66f', textColor: '#56753e', lineColor: '#abc78f' },
})

const externalNodes = computed(() => props.content.nodes.filter((node) => node.url))
const coreNodeIds = new Set([
  'chebi',
  'inchikey',
  'smiles',
  'formula',
  'mass',
  'spectra',
  'hmdb',
  'biofluid',
  'pathway',
  'metabolights',
  'msi',
  'provenance',
])
const desktopNodes = computed(() => props.content.nodes.filter((node) => coreNodeIds.has(node.id)))
const expandedGroups = ref(new Set())

function nodesForGroup(groupId) {
  return props.content.nodes.filter((node) => node.group === groupId)
}

function toggleGroup(groupId) {
  const next = new Set(expandedGroups.value)
  if (next.has(groupId)) next.delete(groupId)
  else next.add(groupId)
  expandedGroups.value = next
}

function tooltipFormatter(params) {
  if (params.dataType === 'edge') return ''
  const group = props.content.groups.find((item) => item.id === params.data.group)
  const type = props.content.nodeTypes[params.data.kind] || props.content.nodeTypes.concept
  return [
    `<strong>${params.name}</strong>`,
    group ? `${props.content.categoryLabel}: ${group.label}` : '',
    params.data.kind ? `${props.content.typeLabel}: ${type}` : '',
    `<span>${params.data.description}</span>`,
  ].filter(Boolean).join('<br>')
}

function centerNode(x, y) {
  return {
    ...props.content.center,
    name: props.content.center.label,
    x,
    y,
    symbol: 'circle',
    symbolSize: 96,
    itemStyle: { color: '#167f9e', borderColor: '#fff', borderWidth: 4 },
    label: { color: '#fff', fontSize: 15, fontWeight: 700 },
  }
}

function hubNode(hub, x, y, compact = false) {
  const style = groupStyles[hub.id]
  return {
    ...hub,
    name: hub.label,
    group: hub.id,
    x,
    y,
    symbol: 'roundRect',
    symbolSize: compact ? [126, 48] : [112, 46],
    itemStyle: { color: style.color, borderColor: style.borderColor, borderWidth: 1.5 },
    label: { color: style.textColor, fontSize: compact ? 11 : 11.5, fontWeight: 650, lineHeight: 14 },
  }
}

function detailNode(node, x, y) {
  const style = groupStyles[node.group]
  const isDatabase = node.kind === 'database'
  return {
    ...node,
    name: node.label,
    x,
    y,
    symbol: 'roundRect',
    symbolSize: [92, 36],
    cursor: 'default',
    itemStyle: {
      color: isDatabase ? style.color : '#fff',
      borderColor: style.borderColor,
      borderWidth: isDatabase ? 2 : 1.1,
      borderType: node.kind === 'identifier' || node.kind === 'standard' ? 'dashed' : 'solid',
    },
    label: { color: style.textColor, fontSize: 9.5, fontWeight: 600, lineHeight: 12 },
  }
}

function graphSeries(data, links, compact = false) {
  return {
    type: 'graph',
    layout: 'none',
    left: compact ? 58 : 44,
    right: compact ? 58 : 44,
    top: compact ? 48 : 34,
    bottom: compact ? 48 : 34,
    roam: false,
    draggable: false,
    data,
    links,
    label: { show: true, position: 'inside', overflow: 'break' },
    lineStyle: { width: 1.35, opacity: 0.82 },
    emphasis: {
      focus: 'adjacency',
      blurScope: 'series',
      itemStyle: { shadowBlur: 11, shadowColor: 'rgba(27, 87, 104, 0.18)' },
      lineStyle: { width: 2.4, opacity: 1 },
    },
    blur: { itemStyle: { opacity: 0.28 }, lineStyle: { opacity: 0.16 } },
  }
}

const desktopOption = computed(() => {
  const hubPositions = Object.freeze({
    identity: [170, 138],
    evidence: [470, 138],
    context: [470, 350],
    standards: [170, 350],
  })
  const detailPositions = Object.freeze({
    chebi: [55, 54],
    pubchem: [166, 32],
    inchikey: [278, 62],
    smiles: [52, 183],
    formula: [370, 48],
    mass: [492, 35],
    spectra: [582, 130],
    gnps: [558, 220],
    hmdb: [585, 305],
    biofluid: [555, 416],
    pathway: [438, 448],
    kegg: [356, 384],
    metabolights: [267, 448],
    msi: [135, 438],
    provenance: [48, 338],
  })

  const data = [centerNode(320, 244)]
  const links = []

  for (const hub of props.content.hubs) {
    data.push(hubNode(hub, ...hubPositions[hub.id]))
    links.push({ source: 'humeta', target: hub.id, lineStyle: { color: groupStyles[hub.id].lineColor } })
  }

  for (const node of desktopNodes.value) {
    data.push(detailNode(node, ...detailPositions[node.id]))
    links.push({ source: node.group, target: node.id, lineStyle: { color: groupStyles[node.group].lineColor } })
  }

  return {
    tooltip: {
      trigger: 'item',
      confine: true,
      backgroundColor: 'rgba(19, 48, 58, 0.94)',
      borderWidth: 0,
      textStyle: { color: '#fff', fontSize: 12, lineHeight: 19 },
      padding: [9, 12],
      formatter: tooltipFormatter,
    },
    series: [graphSeries(data, links)],
  }
})

const compactOption = computed(() => {
  const positions = [[180, 30], [326, 166], [180, 302], [34, 166]]
  const data = [centerNode(180, 166)]
  const links = []

  props.content.hubs.forEach((hub, index) => {
    data.push(hubNode(hub, ...positions[index], true))
    links.push({ source: 'humeta', target: hub.id, lineStyle: { color: groupStyles[hub.id].lineColor } })
  })

  return {
    tooltip: {
      trigger: 'item',
      confine: true,
      backgroundColor: 'rgba(19, 48, 58, 0.94)',
      borderWidth: 0,
      textStyle: { color: '#fff', fontSize: 12, lineHeight: 19 },
      padding: [9, 12],
      formatter: tooltipFormatter,
    },
    series: [graphSeries(data, links, true)],
  }
})
</script>

<template>
  <figure class="network-figure">
    <div class="figure-heading">
      <span>Interoperable knowledge</span>
      <h3>{{ content.title }}</h3>
    </div>

    <ul class="network-legend" aria-hidden="true">
      <li v-for="group in content.groups" :key="group.id">
        <span :style="{ backgroundColor: groupStyles[group.id].color, borderColor: groupStyles[group.id].borderColor }" />
        {{ group.label }}
      </li>
    </ul>

    <ul class="node-kind-legend" aria-hidden="true">
      <li><span class="node-kind-legend__database" />{{ content.nodeTypes.database }}</li>
      <li><span class="node-kind-legend__concept" />{{ content.nodeTypes.concept }}</li>
    </ul>

    <AboutEChart
      chart-key="about-knowledge-network"
      :option="desktopOption"
      :compact-option="compactOption"
      :aria-label="content.ariaLabel"
      :summary="content.summary"
      :fallback="content.summary"
      :min-height="500"
      :compact-min-height="325"
    />

    <div class="network-mobile-groups">
      <section v-for="group in content.groups" :key="group.id">
        <button
          type="button"
          :aria-expanded="expandedGroups.has(group.id)"
          :aria-controls="`network-group-${group.id}`"
          @click="toggleGroup(group.id)"
          @keydown.enter.prevent="toggleGroup(group.id)"
          @keydown.space.prevent="toggleGroup(group.id)"
        >
          <span>{{ group.label }}</span>
          <span aria-hidden="true">{{ expandedGroups.has(group.id) ? '−' : '+' }}</span>
        </button>
        <ul :id="`network-group-${group.id}`" v-show="expandedGroups.has(group.id)">
          <li v-for="node in nodesForGroup(group.id)" :key="node.id">
            <span>{{ node.label }}</span>
            <small>{{ node.description }}</small>
          </li>
        </ul>
      </section>
    </div>

    <nav class="network-links" :aria-label="content.externalLinksLabel">
      <a v-for="node in externalNodes" :key="node.id" :href="node.url" target="_blank" rel="noreferrer">
        {{ node.label }} <span aria-hidden="true">↗</span>
      </a>
    </nav>

    <figcaption>{{ content.caption }}</figcaption>
  </figure>
</template>

<style scoped>
.network-figure {
  width: 100%;
  max-width: 650px;
  min-width: 0;
  margin: 0 auto;
}

.figure-heading {
  text-align: center;
}

.figure-heading > span {
  color: #65a8b5;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.figure-heading h3 {
  margin: 7px 0 0;
  color: #244c58;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.network-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7px 15px;
  padding: 0;
  margin: 13px 0 -8px;
  color: #6d8188;
  font-size: 10.5px;
  list-style: none;
}

.node-kind-legend {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 0;
  margin: 10px 0 -13px;
  color: #7a8d92;
  font-size: 10px;
  list-style: none;
}

.node-kind-legend li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.node-kind-legend li > span {
  width: 16px;
  height: 9px;
  border: 1px solid #78aab5;
  border-radius: 3px;
}

.node-kind-legend__database {
  background: #e7f2f4;
  border-width: 2px !important;
}

.node-kind-legend__concept {
  background: #fff;
}

.network-legend li {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.network-legend li > span {
  width: 8px;
  height: 8px;
  border: 1px solid;
  border-radius: 2px;
}

.network-mobile-groups {
  display: none;
}

.network-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7px 14px;
  margin-top: -1px;
}

.network-links a,
.network-mobile-groups a {
  color: #147c95;
  font-size: 12px;
  line-height: 1.6;
  text-underline-offset: 3px;
}

figcaption {
  margin-top: 11px;
  color: #687f87;
  font-size: 12.5px;
  line-height: 1.65;
  text-align: center;
}

@media (max-width: 600px) {
  .network-figure {
    max-width: 390px;
  }

  .figure-heading h3 {
    font-size: 15px;
  }

  .network-mobile-groups {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    margin-top: 4px;
  }

  .network-mobile-groups section {
    min-width: 0;
    border-top: 1px solid #d4e3e6;
  }

  .network-mobile-groups button {
    display: flex;
    width: 100%;
    min-height: 48px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #426671;
    font: inherit;
    font-size: 13px;
    font-weight: 650;
    text-align: left;
    cursor: pointer;
  }

  .network-mobile-groups ul {
    display: grid;
    gap: 10px;
    padding: 3px 0 16px 18px;
    margin: 0;
    list-style: none;
  }

  .network-mobile-groups li {
    display: grid;
    gap: 2px;
  }

  .network-mobile-groups li > span {
    color: #426671;
    font-size: 12.5px;
    font-weight: 600;
  }

  .network-mobile-groups li small {
    color: #71848a;
    font-size: 12px;
    line-height: 1.55;
  }

  .network-links {
    display: none;
  }

  figcaption {
    text-align: left;
  }
}
</style>
