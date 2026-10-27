export const DEFAULT_BROWSER_PRODUCT_TYPE = 'all'

export const BROWSER_PRODUCT_OPTIONS = Object.freeze([
  Object.freeze({ value: DEFAULT_BROWSER_PRODUCT_TYPE, label: 'All Products' }),
])

export function normalizeBrowserProductType(value) {
  const candidate = typeof value === 'string' ? value.trim().toLocaleLowerCase() : ''
  const isSupported = BROWSER_PRODUCT_OPTIONS.some((option) => option.value === candidate)

  return isSupported ? candidate : DEFAULT_BROWSER_PRODUCT_TYPE
}

export function browserProductTypeQueryValue(value) {
  const normalized = normalizeBrowserProductType(value)
  return normalized === DEFAULT_BROWSER_PRODUCT_TYPE ? undefined : normalized
}
