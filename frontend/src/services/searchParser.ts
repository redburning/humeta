import type { SearchQuery } from '../types/search'

const HMDB_PATTERN = /^HMDB\d+$/i
const KEGG_PATTERN = /^C\d{5}$/
const CHEBI_PATTERN = /^CHEBI:\d+$/i
const INCHIKEY_PATTERN = /^(?=.{20,30}$)[A-Z0-9]+(?:-[A-Z0-9]+)+$/
const METABOLITE_ID_PATTERN = /^(?:IPTM[\w-]+|LMFA\d+)$/i
const FORMULA_PATTERN = /^(?:(?:C|H|N|O|P|S|F|Cl|Br|I|B|Si|Se|Na|K|Ca|Mg|Fe|Zn|Cu|Mn)\d*)+$/
const SMILES_MARKER_PATTERN = /[=()[\]@\\]/

export function parseSearchKeyword(keyword: string): SearchQuery {
  const normalizedKeyword = keyword.trim()

  if (HMDB_PATTERN.test(normalizedKeyword)) {
    return { keyword: normalizedKeyword, normalizedKeyword, field: 'hmdb' }
  }

  if (KEGG_PATTERN.test(normalizedKeyword)) {
    return { keyword: normalizedKeyword, normalizedKeyword, field: 'kegg' }
  }

  if (CHEBI_PATTERN.test(normalizedKeyword)) {
    return { keyword: normalizedKeyword, normalizedKeyword, field: 'chebi' }
  }

  if (INCHIKEY_PATTERN.test(normalizedKeyword)) {
    return { keyword: normalizedKeyword, normalizedKeyword, field: 'inchikey' }
  }

  if (METABOLITE_ID_PATTERN.test(normalizedKeyword)) {
    return { keyword: normalizedKeyword, normalizedKeyword, field: 'id' }
  }

  if (FORMULA_PATTERN.test(normalizedKeyword)) {
    return { keyword: normalizedKeyword, normalizedKeyword, field: 'formula' }
  }

  if (SMILES_MARKER_PATTERN.test(normalizedKeyword)) {
    return { keyword: normalizedKeyword, normalizedKeyword, field: 'smiles' }
  }

  return { keyword: normalizedKeyword, normalizedKeyword, field: 'name' }
}
