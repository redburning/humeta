<script setup>
import { computed } from 'vue'
import AboutEChart from './AboutEChart.vue'

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
})

const locale = computed(() => (props.content.countAxis === '实体数' ? 'zh-CN' : 'en-US'))
const integerFormatter = computed(() => new Intl.NumberFormat(locale.value))
const massFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

function binName(bin) {
  return `${bin.lower}–${bin.upper}`
}

function tooltipFormatter(params) {
  const item = Array.isArray(params) ? params[0] : params
  if (item.seriesType === 'bar') {
    const bin = props.content.bins[item.dataIndex]
    const share = ((bin.count / props.content.includedEntities) * 100).toFixed(1)
    return [
      `<strong>${props.content.binLabel}: ${binName(bin)} Da</strong>`,
      `${props.content.countLabel}: ${integerFormatter.value.format(bin.count)}`,
      `${props.content.percentageLabel}: ${share}%`,
    ].join('<br>')
  }

  const values = Array.isArray(item.data) ? item.data : item.value
  return [
    `<strong>${props.content.boxAxis}</strong>`,
    `${props.content.minLabel}: ${massFormatter.format(values[0])} Da`,
    `${props.content.q1Label}: ${massFormatter.format(values[1])} Da`,
    `${props.content.medianLabel}: ${massFormatter.format(values[2])} Da`,
    `${props.content.q3Label}: ${massFormatter.format(values[3])} Da`,
    `${props.content.maxLabel}: ${massFormatter.format(values[4])} Da`,
  ].join('<br>')
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
    grid: [
      { left: compact ? 44 : 70, right: 16, top: 28, height: compact ? '55%' : '57%', containLabel: false },
      { left: compact ? 44 : 70, right: 16, top: compact ? '76%' : '77%', height: compact ? 42 : 48, containLabel: false },
    ],
    xAxis: [
      {
        type: 'category',
        gridIndex: 0,
        data: props.content.bins.map(binName),
        axisLine: { lineStyle: { color: '#93aeb5' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#617980',
          fontSize: compact ? 9.5 : 10.5,
          interval: compact ? 1 : 0,
          rotate: compact ? 32 : 0,
          margin: 9,
        },
        name: props.content.massAxis,
        nameLocation: 'middle',
        nameGap: compact ? 42 : 32,
        nameTextStyle: { color: '#536d75', fontSize: compact ? 10.5 : 11 },
      },
      {
        type: 'value',
        gridIndex: 1,
        min: 0,
        max: 1500,
        interval: compact ? 500 : 300,
        axisLine: { show: true, lineStyle: { color: '#93aeb5' } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: '#617980', fontSize: compact ? 9.5 : 10 },
      },
    ],
    yAxis: [
      {
        type: 'value',
        gridIndex: 0,
        name: props.content.countAxis,
        nameLocation: 'middle',
        nameGap: compact ? 34 : 46,
        nameRotate: 90,
        nameTextStyle: { color: '#536d75', fontSize: compact ? 10.5 : 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#617980', fontSize: compact ? 9.5 : 10.5 },
        splitLine: { lineStyle: { color: '#e3ecee', type: 'dashed' } },
      },
      {
        type: 'category',
        gridIndex: 1,
        data: [props.content.boxAxis],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#617980', fontSize: compact ? 9.5 : 10 },
      },
    ],
    series: [
      {
        name: props.content.countAxis,
        type: 'bar',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: props.content.bins.map((bin) => bin.count),
        barMaxWidth: compact ? 18 : 25,
        itemStyle: {
          color: (params) => (params.dataIndex % 2 === 0 ? '#68bddd' : '#86ccef'),
          borderRadius: [2, 2, 0, 0],
        },
        emphasis: {
          itemStyle: { color: '#2d9fba' },
        },
      },
      {
        name: props.content.boxAxis,
        type: 'boxplot',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: [props.content.boxplot],
        boxWidth: compact ? [12, 24] : [15, 30],
        itemStyle: {
          color: 'rgba(79, 190, 171, 0.28)',
          borderColor: '#278f83',
          borderWidth: 1.5,
        },
        emphasis: {
          itemStyle: { color: 'rgba(79, 190, 171, 0.46)', borderColor: '#166f68' },
        },
      },
    ],
  }
}

const desktopOption = computed(() => option(false))
const compactOption = computed(() => option(true))
</script>

<template>
  <figure class="distribution-figure">
    <div class="figure-heading">
      <span>ChEBI · Release 253 · n={{ integerFormatter.format(content.includedEntities) }}</span>
      <h3>{{ content.title }}</h3>
    </div>

    <AboutEChart
      chart-key="about-mass-distribution"
      :option="desktopOption"
      :compact-option="compactOption"
      :compact-breakpoint="700"
      :aria-label="content.ariaLabel"
      :summary="content.summary"
      :fallback="content.summary"
      :min-height="430"
      :compact-min-height="390"
    />

    <dl class="distribution-stats">
      <div>
        <dt>{{ content.includedLabel }}</dt>
        <dd>{{ integerFormatter.format(content.includedEntities) }}</dd>
      </div>
      <div>
        <dt>{{ content.medianStatLabel }}</dt>
        <dd>{{ massFormatter.format(content.boxplot[2]) }} Da</dd>
      </div>
      <div>
        <dt>{{ content.q3StatLabel }}</dt>
        <dd>{{ massFormatter.format(content.boxplot[3]) }} Da</dd>
      </div>
    </dl>

    <figcaption>
      {{ content.caption }}
      <a :href="content.sourceUrl" target="_blank" rel="noreferrer">{{ content.sourceLabel }}</a>
    </figcaption>
  </figure>
</template>

<style scoped>
.distribution-figure {
  width: 100%;
  max-width: 710px;
  min-width: 0;
  margin: 0 auto;
}

.figure-heading {
  text-align: center;
}

.figure-heading span {
  color: #65a8b5;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.figure-heading h3 {
  margin: 7px 0 0;
  color: #244c58;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.distribution-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 570px;
  margin: 9px auto 0;
}

.distribution-stats div {
  padding: 5px 18px;
  text-align: center;
}

.distribution-stats div + div {
  border-left: 1px solid #dbe7ea;
}

.distribution-stats dt {
  color: #71858b;
  font-size: 10px;
  line-height: 1.4;
}

.distribution-stats dd {
  margin: 4px 0 0;
  color: #24586a;
  font-size: 15px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

figcaption {
  margin-top: 18px;
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

@media (max-width: 700px) {
  .distribution-figure {
    max-width: 400px;
  }

  .figure-heading h3 {
    font-size: 15px;
  }

  .distribution-stats div {
    padding-inline: 8px;
  }

  .distribution-stats dd {
    font-size: 13px;
  }

  figcaption {
    text-align: left;
  }
}
</style>
