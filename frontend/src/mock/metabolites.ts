import type { MetaboliteSearchRecord } from '../types/search'

export const mockMetabolites: readonly MetaboliteSearchRecord[] = Object.freeze([
  Object.freeze({
    id: 'IPTM00001',
    metaboliteId: 'IPTM10630E',
    alternateIds: Object.freeze(['LMFA07070050']),
    name: 'Tryptophan',
    chineseName: '色氨酸',
    synonyms: Object.freeze(['L-Tryptophan', 'L-色氨酸']),
    hmdb: 'HMDB0000929',
    kegg: 'C00078',
    chebi: 'CHEBI:57589',
    formula: 'C11H12N2O2',
    inchikey: 'QIVBCDIJIAJPQS-VIFPVBQESA-N',
    smiles: 'C1=CC=C2C(=C1)C(=CN2)C[C@@H](C(=O)O)N',
    key: 'result-1',
    cas: '73-22-3',
    pubchem: 'CID:6305',
    lipidMaps: 'LMFA07070050',
    swissLipids: 'SLM:000501423',
    monoisotopicMw: '204.08988',
    category: 'Metabolite1',
    structureImage: '/images/tryptophan-structure.svg',
  }),
])
