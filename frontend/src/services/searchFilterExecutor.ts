import type { MetaboliteSearchRecord, SearchFilter } from '../types/search'

type FilterableMetaboliteRecord = MetaboliteSearchRecord & {
  molecularWeight?: number | string
  chemicalClass?: string
}

function normalizeText(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase()
}

function matchesEquals(recordValue: unknown, filterValue: SearchFilter['value']): boolean {
  return (
    typeof recordValue === 'string'
    && typeof filterValue === 'string'
    && normalizeText(recordValue) === normalizeText(filterValue)
  )
}

function matchesContains(recordValue: unknown, filterValue: SearchFilter['value']): boolean {
  if (typeof recordValue !== 'string' || typeof filterValue !== 'string') return false

  const normalizedFilterValue = normalizeText(filterValue)
  return normalizedFilterValue.length > 0
    && normalizeText(recordValue).includes(normalizedFilterValue)
}

function matchesRange(recordValue: unknown, filterValue: SearchFilter['value']): boolean {
  if (!Array.isArray(filterValue) || filterValue.length !== 2) return false

  const [minimum, maximum] = filterValue
  if (
    typeof minimum !== 'number'
    || typeof maximum !== 'number'
    || !Number.isFinite(minimum)
    || !Number.isFinite(maximum)
    || minimum > maximum
  ) return false

  const numericValue = typeof recordValue === 'number'
    ? recordValue
    : Number.parseFloat(String(recordValue))
  if (!Number.isFinite(numericValue)) return false

  return numericValue >= minimum && numericValue <= maximum
}

function matchesFilter(
  record: MetaboliteSearchRecord,
  filter: SearchFilter,
): boolean {
  const filterableRecord = record as FilterableMetaboliteRecord

  if (filter.field === 'formula' && filter.operator === 'equals') {
    return matchesEquals(record.formula, filter.value)
  }
  if (filter.field === 'hmdb' && filter.operator === 'equals') {
    return matchesEquals(record.hmdb, filter.value)
  }
  if (filter.field === 'kegg' && filter.operator === 'equals') {
    return matchesEquals(record.kegg, filter.value)
  }
  if (filter.field === 'chebi' && filter.operator === 'equals') {
    return matchesEquals(record.chebi, filter.value)
  }

  if (filter.field === 'molecularWeight' && filter.operator === 'range') {
    return matchesRange(
      filterableRecord.molecularWeight ?? record.monoisotopicMw,
      filter.value,
    )
  }

  if (filter.field === 'chemicalClass' && filter.operator === 'contains') {
    return matchesContains(
      filterableRecord.chemicalClass ?? record.category,
      filter.value,
    )
  }

  return false
}

export function applyFilters<T extends MetaboliteSearchRecord>(
  results: readonly T[],
  filters: readonly SearchFilter[],
): T[] {
  if (filters.length === 0) return [...results]

  return results.filter((record) => (
    filters.every((filter) => matchesFilter(record, filter))
  ))
}
