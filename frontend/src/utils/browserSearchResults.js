function normalizedIdentity(value) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export function deduplicateMetaboliteResults(results) {
  const seen = new Set()

  return results.filter((record) => {
    const canonicalId = normalizedIdentity(record?.id)
    const stableKey = canonicalId
      ? `id:${canonicalId.toLocaleUpperCase()}`
      : normalizedIdentity(record?.key)
        ? `key:${normalizedIdentity(record.key)}`
        : ''

    if (!stableKey) return true
    if (seen.has(stableKey)) return false

    seen.add(stableKey)
    return true
  })
}

export function parsePageQuery(value) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return 1

  const parsed = Number(value)
  return Number.isSafeInteger(parsed) ? parsed : 1
}

export function normalizePage(page, totalPages) {
  const lastPage = Number.isSafeInteger(totalPages) && totalPages > 0 ? totalPages : 1
  const requestedPage = Number.isSafeInteger(page) && page > 0 ? page : 1
  return Math.min(requestedPage, lastPage)
}

export function paginateResults(results, page, pageSize) {
  const start = (page - 1) * pageSize
  return results.slice(start, start + pageSize)
}
