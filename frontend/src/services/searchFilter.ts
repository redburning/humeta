import type {
  SearchFilter,
  SearchFilterField,
  SearchFilterOperator,
  SearchFilterValue,
} from '../types/search'

export interface SearchFilterInput {
  field: string
  operator?: SearchFilterOperator
  value: unknown
}

interface FilterDefinition {
  operator: SearchFilterOperator
  valueType: 'string' | 'range'
}

const FILTER_DEFINITIONS: Record<SearchFilterField, FilterDefinition> = {
  formula: { operator: 'equals', valueType: 'string' },
  hmdb: { operator: 'equals', valueType: 'string' },
  kegg: { operator: 'equals', valueType: 'string' },
  chebi: { operator: 'equals', valueType: 'string' },
  molecularWeight: { operator: 'range', valueType: 'range' },
  chemicalClass: { operator: 'contains', valueType: 'string' },
}

const SEARCH_FILTER_FIELDS = new Set<SearchFilterField>(
  Object.keys(FILTER_DEFINITIONS) as SearchFilterField[],
)

function isSearchFilterField(value: unknown): value is SearchFilterField {
  return typeof value === 'string' && SEARCH_FILTER_FIELDS.has(value as SearchFilterField)
}

function isSearchFilterOperator(value: unknown): value is SearchFilterOperator {
  return value === 'equals' || value === 'contains' || value === 'range'
}

function normalizeStringValue(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const normalizedValue = value.normalize('NFKC').trim()
  return normalizedValue || null
}

function normalizeRangeValue(value: unknown): [number, number] | null {
  if (
    !Array.isArray(value)
    || value.length !== 2
    || !value.every((item) => typeof item === 'number' && Number.isFinite(item))
  ) return null

  const [first, second] = value
  return first <= second ? [first, second] : [second, first]
}

function normalizeFilterValue(
  definition: FilterDefinition,
  value: unknown,
): SearchFilterValue | null {
  return definition.valueType === 'range'
    ? normalizeRangeValue(value)
    : normalizeStringValue(value)
}

export function validateFilter(filter: unknown): filter is SearchFilter {
  if (!filter || typeof filter !== 'object') return false

  const candidate = filter as Partial<SearchFilter>
  if (!isSearchFilterField(candidate.field)) return false
  if (!isSearchFilterOperator(candidate.operator)) return false

  const definition = FILTER_DEFINITIONS[candidate.field]
  if (candidate.operator !== definition.operator) return false

  if (definition.valueType === 'string') {
    return typeof candidate.value === 'string' && candidate.value.trim().length > 0
  }

  return (
    Array.isArray(candidate.value)
    && candidate.value.length === 2
    && candidate.value.every((item) => typeof item === 'number' && Number.isFinite(item))
    && candidate.value[0] <= candidate.value[1]
  )
}

export function createFilter(input: SearchFilterInput): SearchFilter | null {
  if (!input || typeof input !== 'object') return null

  const field = typeof input.field === 'string' ? input.field.trim() : ''
  if (!isSearchFilterField(field)) return null

  const definition = FILTER_DEFINITIONS[field]
  const operator = input.operator ?? definition.operator
  const value = normalizeFilterValue(definition, input.value)
  if (!isSearchFilterOperator(operator) || value === null) return null

  const filter: SearchFilter = { field, operator, value }
  return validateFilter(filter) ? filter : null
}

export function normalizeFilters(filters: readonly unknown[]): SearchFilter[] {
  if (!Array.isArray(filters)) return []

  const normalizedFilters: SearchFilter[] = []
  const seenFilters = new Set<string>()

  filters.forEach((filter) => {
    const normalizedFilter = createFilter(filter as SearchFilterInput)
    if (!normalizedFilter) return

    const identity = JSON.stringify(normalizedFilter)
    if (seenFilters.has(identity)) return

    seenFilters.add(identity)
    normalizedFilters.push(normalizedFilter)
  })

  return normalizedFilters
}
