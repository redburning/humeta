export type SearchField =
  | 'name'
  | 'id'
  | 'hmdb'
  | 'kegg'
  | 'chebi'
  | 'formula'
  | 'inchikey'
  | 'smiles'

export interface SearchToken {
  label: string
  value: string
  field: SearchField
}

export interface SearchQuery {
  keyword: string
  normalizedKeyword: string
  field: SearchField
}

export type SearchFilterField =
  | 'formula'
  | 'hmdb'
  | 'kegg'
  | 'chebi'
  | 'molecularWeight'
  | 'chemicalClass'

export type SearchFilterOperator = 'equals' | 'contains' | 'range'

export type SearchFilterValue = string | number | [number, number]

export interface SearchFilter {
  field: string
  operator: SearchFilterOperator
  value: SearchFilterValue
}

export interface AdvancedSearchQuery {
  keyword?: string
  normalizedKeyword?: string
  field?: SearchField
  filters?: SearchFilter[]
}

export interface SearchHistoryItem {
  keyword: string
  normalizedKeyword: string
  field: SearchField
  label: string
  timestamp: number
}

export type SearchMatchType = 'exact' | 'identifier' | 'alias' | 'fuzzy'

export interface SearchResultItem {
  id: string
  name: string
  matchedField: string
  matchType: SearchMatchType
  score: number
}

export interface SearchExplanation {
  primaryMatch: string
  matchedFields: string[]
  matchType: SearchMatchType
  score: number
}

export type SuggestionCategory = 'Metabolite' | 'Identifier' | 'Formula' | 'Structure'

export interface SuggestionItem {
  label: string
  value: string
  field: SearchField
  category: SuggestionCategory
  matchType: SearchMatchType
  score: number
}

export interface MetaboliteSearchRecord {
  id: string
  metaboliteId: string
  alternateIds: readonly string[]
  name: string
  chineseName: string
  synonyms: readonly string[]
  hmdb: string
  kegg: string
  chebi: string
  formula: string
  inchikey: string
  smiles: string
  key: string
  cas: string
  pubchem: string
  lipidMaps: string
  swissLipids: string
  monoisotopicMw: string
  category: string
  structureImage: string
}

export type RankedMetaboliteSearchRecord = MetaboliteSearchRecord & SearchResultItem

export interface MetaboliteSearchPage {
  items: MetaboliteSearchRecord[]
  total: number
  page: number
  size: number
  totalPages: number
}

export interface SearchPageOptions {
  page?: number
  size?: number
}

export interface SearchAdapter {
  searchMetabolites(
    query: SearchQuery | readonly SearchQuery[],
    options?: SearchPageOptions,
  ): Promise<MetaboliteSearchPage>
}
