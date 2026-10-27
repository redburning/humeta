<script setup>
import { computed } from 'vue'
import AboutEChart from './AboutEChart.vue'

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
})

const palette = Object.freeze({
  lipids: '#2e96b5',
  fattyAcids: '#74c6d8',
  steroids: '#5bb2c8',
  otherLipids: '#a5dbe4',
  otherOrganic: '#48b99e',
  aminoAcids: '#8ad2b7',
  carbohydrates: '#b8dfc9',
  nucleobaseContaining: '#75c8ad',
  otherOrganicAcids: '#5bbf9e',
  otherOrganicMolecules: '#a8dac5',
  remainingClasses: '#c9ddd8',
  otherEntities: '#8d9fc9',
})

const formatter = computed(() =>
  new Intl.NumberFormat(props.content.countLabel === '实体数' ? 'zh-CN' : 'en-US'),
)

const compactHierarchy = computed(() =>
  props.content.hierarchy.map((branch) => {
    if (branch.id !== 'otherOrganic') return branch

    const coreIds = new Set(['otherOrganicMolecules', 'otherOrganicAcids'])
    const coreChildren = branch.children.filter((child) => coreIds.has(child.id))
    const remainingValue = branch.children
      .filter((child) => !coreIds.has(child.id))
      .reduce((sum, child) => sum + child.value, 0)

    return {
      ...branch,
      children: [...coreChildren, { id: 'remainingClasses', value: remainingValue }],
    }
  }),
)

function mapNode(node) {
  return {
    name: props.content.labels[node.id],
    value: node.value,
    itemStyle: { color: palette[node.id] },
    children: node.children?.map(mapNode),
  }
}

function tooltipFormatter(params) {
  const share = ((params.value / props.content.total) * 100).toFixed(1)
  const path = (params.treePathInfo || []).filter((entry) => entry.name)
  const parent = path.length > 1 ? path.at(-2).name : props.content.rootLabel
  return [
    `<strong>${params.name}</strong>`,
    `${props.content.countLabel}: ${formatter.value.format(params.value)}`,
    `${props.content.shareLabel}: ${share}%`,
    `${props.content.levelLabel}: ${path.length || 1}`,
    `${props.content.parentLabel}: ${parent}`,
  ].join('<br>')
}

function labelFormatter(params, compact = false) {
  const path = (params.treePathInfo || []).filter((entry) => entry.name)
  if (!compact && path.length > 1 && params.value < 200) return ''
  if (compact && path.length > 1 && params.value < 220) return params.name
  return `${params.name}\n${formatter.value.format(params.value)}`
}

function option(compact = false) {
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
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: compact ? '40.5%' : '40%',
        silent: true,
        style: {
          text: `{value|${props.content.centerValue}}\n{label|${props.content.centerCaption}}`,
          textAlign: 'center',
          textVerticalAlign: 'middle',
          fill: '#244d5a',
          fontFamily: 'Arial, Microsoft YaHei, 微软雅黑, sans-serif',
          rich: {
            value: {
              fill: '#1d6174',
              fontSize: compact ? 18 : 27,
              fontWeight: 650,
              lineHeight: compact ? 24 : 34,
            },
            label: {
              fill: '#6b848b',
              fontSize: compact ? 9 : 11,
              fontWeight: 550,
              lineHeight: compact ? 13 : 16,
            },
          },
        },
      },
    ],
    series: [
      {
        type: 'sunburst',
        center: ['50%', compact ? '48%' : '49%'],
        radius: compact ? ['27%', '88%'] : ['20%', '96%'],
        sort: null,
        nodeClick: false,
        data: (compact ? compactHierarchy.value : props.content.hierarchy).map(mapNode),
        label: {
          show: true,
          color: '#183f4d',
          fontSize: compact ? 10 : 11,
          fontWeight: 500,
          lineHeight: compact ? 11 : 14,
          minAngle: compact ? 12 : 7,
          rotate: compact ? 'tangential' : 'radial',
          formatter: (params) => labelFormatter(params, compact),
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: compact ? 2 : 2.5,
        },
        emphasis: {
          focus: 'ancestor',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(24, 84, 100, 0.18)',
          },
        },
        blur: {
          itemStyle: { opacity: 0.28 },
          label: { opacity: 0.28 },
        },
        levels: [
          {},
          { r0: compact ? '27%' : '20%', r: '55%', label: { rotate: 0, fontSize: compact ? 10.5 : 12, fontWeight: 650 } },
          { r0: '55%', r: compact ? '88%' : '96%' },
        ],
      },
    ],
  }
}

const desktopOption = computed(() => option(false))
const compactOption = computed(() => option(true))
</script>

<template>
  <figure class="taxonomy-figure">
    <div class="figure-heading">
      <span>ChEBI · Release 253</span>
      <h3>{{ content.title }}</h3>
    </div>

    <AboutEChart
      chart-key="about-taxonomy"
      :option="desktopOption"
      :compact-option="compactOption"
      :aria-label="content.ariaLabel"
      :summary="content.summary"
      :fallback="content.summary"
      :min-height="610"
      :compact-min-height="370"
    />

    <ul class="taxonomy-summary" aria-hidden="true">
      <li v-for="branch in content.hierarchy" :key="branch.id">
        <span :style="{ backgroundColor: palette[branch.id] }" />
        <strong>{{ content.labels[branch.id] }}</strong>
        {{ formatter.format(branch.value) }}
      </li>
    </ul>

    <div class="taxonomy-mobile-detail" :aria-label="content.detailListLabel">
      <details v-for="branch in content.hierarchy" :key="branch.id">
        <summary>
          <span>{{ content.labels[branch.id] }}</span>
          <strong>{{ formatter.format(branch.value) }}</strong>
        </summary>
        <ul v-if="branch.children.length">
          <li v-for="child in branch.children" :key="child.id">
            <span>{{ content.labels[child.id] }}</span>
            <strong>{{ formatter.format(child.value) }}</strong>
          </li>
        </ul>
        <p v-else>{{ content.noSubclassesLabel }}</p>
      </details>
    </div>

    <figcaption>
      {{ content.caption }}
      <a :href="content.sourceUrl" target="_blank" rel="noreferrer">{{ content.sourceLabel }}</a>
    </figcaption>
  </figure>
</template>

<style scoped>
.taxonomy-figure {
  width: 100%;
  max-width: 760px;
  min-width: 0;
  margin: 0 auto;
}

.figure-heading {
  margin-bottom: -2px;
  text-align: center;
}

.figure-heading span {
  color: #60a8b5;
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

.taxonomy-summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7px 18px;
  padding: 0;
  margin: -4px 0 0;
  color: #71848a;
  font-size: 11px;
  list-style: none;
}

.taxonomy-mobile-detail {
  display: none;
}

.taxonomy-summary li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.taxonomy-summary span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.taxonomy-summary strong {
  color: #3d616c;
  font-weight: 600;
}

figcaption {
  margin-top: 13px;
  color: #687f87;
  font-size: 12.5px;
  line-height: 1.65;
  text-align: center;
}

figcaption a {
  display: inline-block;
  margin-left: 0.35em;
  color: #147d95;
  text-underline-offset: 3px;
}

@media (max-width: 600px) {
  .taxonomy-figure {
    max-width: 390px;
  }

  .figure-heading h3 {
    font-size: 15px;
  }

  .taxonomy-summary {
    display: none;
  }

  .taxonomy-mobile-detail {
    display: grid;
    gap: 7px;
    margin-top: 7px;
  }

  .taxonomy-mobile-detail details {
    border-top: 1px solid #d9e5e8;
  }

  .taxonomy-mobile-detail summary {
    display: flex;
    min-height: 44px;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    color: #355c68;
    font-size: 13px;
    cursor: pointer;
  }

  .taxonomy-mobile-detail summary strong,
  .taxonomy-mobile-detail li strong {
    color: #278c98;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
  }

  .taxonomy-mobile-detail ul {
    display: grid;
    gap: 7px;
    padding: 0 0 12px 18px;
    margin: 0;
    list-style: none;
  }

  .taxonomy-mobile-detail li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: #687e85;
    font-size: 12px;
    line-height: 1.5;
  }

  .taxonomy-mobile-detail p {
    margin: -2px 0 12px 18px;
    color: #71858b;
    font-size: 12px;
  }

  figcaption {
    text-align: left;
  }
}
</style>
