import { nextTick, onBeforeUnmount, onMounted, shallowRef, unref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { DataZoomComponent, GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, DataZoomComponent, GridComponent, TooltipComponent, CanvasRenderer])

export function useSpectrumChart(elementRef, optionSource) {
  const chart = shallowRef(null)
  let resizeObserver
  let resizeFrame = 0
  let mountFrame = 0

  function applyOption() {
    const option = unref(optionSource)
    if (!chart.value || !option) return
    chart.value.setOption(option, true)
  }

  async function initialize() {
    await nextTick()
    if (chart.value || !elementRef.value) return
    chart.value = echarts.init(elementRef.value, null, { renderer: 'canvas' })
    applyOption()

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        window.cancelAnimationFrame(resizeFrame)
        resizeFrame = window.requestAnimationFrame(() => chart.value?.resize())
      })
      resizeObserver.observe(elementRef.value)
    }
  }

  function resetZoom() {
    chart.value?.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
  }

  function downloadPng(fileName) {
    if (!chart.value) return false
    const link = document.createElement('a')
    link.download = fileName
    link.href = chart.value.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#ffffff' })
    link.click()
    return true
  }

  function dispose() {
    window.cancelAnimationFrame(mountFrame)
    window.cancelAnimationFrame(resizeFrame)
    resizeObserver?.disconnect()
    resizeObserver = undefined
    chart.value?.dispose()
    chart.value = null
  }

  watch(optionSource, applyOption, { deep: true })

  onMounted(() => {
    mountFrame = window.requestAnimationFrame(initialize)
  })

  onBeforeUnmount(dispose)

  return { chart, dispose, downloadPng, resetZoom }
}

