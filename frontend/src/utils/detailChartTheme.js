const chartFontFamily = 'Arial, "Microsoft YaHei", "微软雅黑", sans-serif'

export const detailChartTheme = {
  gridLine: '#edf2f5',
  axisLine: '#c7d4dc',
  axisTick: '#b8c7d0',
  axisLabel: {
    color: '#617684',
    fontFamily: chartFontFamily,
    fontSize: 12,
  },
  axisName: {
    color: '#526b7a',
    fontFamily: chartFontFamily,
    fontSize: 12,
  },
  legendText: {
    color: '#526b7a',
    fontFamily: chartFontFamily,
    fontSize: 12,
  },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#dce6ec',
    borderWidth: 1,
    borderRadius: 4,
    padding: [8, 10],
    shadowBlur: 12,
    shadowColor: 'rgba(25, 55, 72, 0.08)',
    shadowOffsetY: 4,
    textStyle: {
      color: '#526b7a',
      fontFamily: chartFontFamily,
      fontSize: 12,
      lineHeight: 18,
    },
    extraCssText: 'box-sizing:border-box;box-shadow:0 4px 12px rgba(25,55,72,0.08);',
  },
}

export function createDetailLegend(overrides = {}) {
  return {
    show: false,
    ...overrides,
    textStyle: {
      ...detailChartTheme.legendText,
      ...overrides.textStyle,
    },
  }
}

export function createDetailTooltip(overrides = {}) {
  return {
    ...detailChartTheme.tooltip,
    ...overrides,
    textStyle: {
      ...detailChartTheme.tooltip.textStyle,
      ...overrides.textStyle,
    },
    extraCssText: `${detailChartTheme.tooltip.extraCssText}${overrides.extraCssText ?? ''}`,
  }
}
