import { onBeforeUnmount, onMounted, shallowRef, unref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, GraphChart, LineChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  GraphChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
  SVGRenderer,
])

export function useECharts(elementRef, optionSource, initOptions = {}) {
  const chart = shallowRef(null)
  let intersectionObserver
  let resizeObserver

  function applyOption() {
    if (!chart.value) return
    const option = unref(optionSource)
    if (option) chart.value.setOption(option, true)
  }

  function resize() {
    chart.value?.resize()
  }

  function initialize() {
    if (chart.value || !elementRef.value) return
    chart.value = echarts.init(elementRef.value, null, { renderer: 'canvas', ...initOptions })
    applyOption()

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(elementRef.value)
    }
  }

  function handleFullscreenChange() {
    window.requestAnimationFrame(resize)
  }

  watch(optionSource, applyOption, { deep: true })

  onMounted(() => {
    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return
          initialize()
          intersectionObserver?.disconnect()
          intersectionObserver = undefined
        },
        { rootMargin: '260px 0px' },
      )
      intersectionObserver.observe(elementRef.value)
    } else {
      initialize()
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
  })

  onBeforeUnmount(() => {
    intersectionObserver?.disconnect()
    resizeObserver?.disconnect()
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    chart.value?.dispose()
    chart.value = null
  })

  return { chart, resize }
}

