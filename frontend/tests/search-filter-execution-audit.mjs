import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  configFile: false,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
})

try {
  const { applyFilters } = await server.ssrLoadModule('/src/services/searchFilterExecutor.ts')
  const { createFilter } = await server.ssrLoadModule('/src/services/searchFilter.ts')
  const { searchMetabolites } = await server.ssrLoadModule('/src/services/searchService.ts')
  const { mockSearchAdapter } = await server.ssrLoadModule('/src/services/adapters/mockSearchAdapter.ts')
  const { mockMetabolites } = await server.ssrLoadModule('/src/mock/metabolites.ts')

  const [tryptophan] = mockMetabolites
  const filterFixture = {
    ...tryptophan,
    chemicalClass: 'Aromatic amino acid',
  }
  const molecularWeightFixture = {
    ...filterFixture,
    molecularWeight: 150,
  }

  const formulaFilter = createFilter({
    field: 'formula',
    value: 'C11H12N2O2',
  })
  assert.deepEqual(
    applyFilters([filterFixture], [formulaFilter]).map((item) => item.id),
    ['IPTM00001'],
  )

  const hmdbFilter = createFilter({
    field: 'hmdb',
    value: 'HMDB0000929',
  })
  assert.deepEqual(
    applyFilters([filterFixture], [hmdbFilter]).map((item) => item.id),
    ['IPTM00001'],
  )

  const molecularWeightFilter = createFilter({
    field: 'molecularWeight',
    operator: 'range',
    value: [100, 200],
  })
  assert.deepEqual(
    applyFilters([molecularWeightFixture], [molecularWeightFilter]).map((item) => item.id),
    ['IPTM00001'],
  )

  const chemicalClassFilter = createFilter({
    field: 'chemicalClass',
    operator: 'contains',
    value: 'amino acid',
  })
  assert.deepEqual(
    applyFilters([filterFixture], [chemicalClassFilter]).map((item) => item.id),
    ['IPTM00001'],
  )

  assert.deepEqual(
    applyFilters([filterFixture], [formulaFilter, chemicalClassFilter]).map((item) => item.id),
    ['IPTM00001'],
  )

  const advancedFormulaResults = await searchMetabolites({
    keyword: 'Tryptophan',
    normalizedKeyword: 'tryptophan',
    field: 'name',
    filters: [formulaFilter],
  }, mockSearchAdapter)
  assert.equal(advancedFormulaResults[0]?.id, 'IPTM00001')
  assert.equal(advancedFormulaResults[0]?.matchType, 'exact')
  assert.equal(advancedFormulaResults[0]?.score, 100)

  const excludedResults = await searchMetabolites({
    keyword: 'Tryptophan',
    normalizedKeyword: 'tryptophan',
    field: 'name',
    filters: [{ field: 'formula', operator: 'equals', value: 'C6H12O6' }],
  }, mockSearchAdapter)
  assert.deepEqual(excludedResults, [])

  const ordinaryResults = await searchMetabolites({
    keyword: 'Tryptophan',
    normalizedKeyword: 'tryptophan',
    field: 'name',
  }, mockSearchAdapter)
  assert.equal(ordinaryResults[0]?.id, 'IPTM00001')
  assert.equal(ordinaryResults[0]?.matchType, 'exact')
  assert.equal(ordinaryResults[0]?.score, 100)

  console.log(JSON.stringify({
    formula: 'PASS',
    hmdb: 'PASS',
    molecularWeight: 'PASS',
    chemicalClass: 'PASS',
    multiFilter: 'PASS',
    searchServiceIntegration: 'PASS',
    ordinarySearchRegression: 'PASS',
  }, null, 2))
} finally {
  await server.close()
}
