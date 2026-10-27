import assert from 'node:assert/strict'
import {
  createFilter,
  normalizeFilters,
  validateFilter,
} from '../src/services/searchFilter.ts'

const formulaFilter = createFilter({
  field: 'formula',
  value: ' C11H12N2O2 ',
})
assert.deepEqual(formulaFilter, {
  field: 'formula',
  operator: 'equals',
  value: 'C11H12N2O2',
})
assert.equal(validateFilter(formulaFilter), true)

const hmdbFilter = createFilter({
  field: 'hmdb',
  value: 'HMDB0000929',
})
assert.deepEqual(hmdbFilter, {
  field: 'hmdb',
  operator: 'equals',
  value: 'HMDB0000929',
})
assert.equal(validateFilter(hmdbFilter), true)

const molecularWeightFilter = createFilter({
  field: 'molecularWeight',
  operator: 'range',
  value: [100, 200],
})
assert.deepEqual(molecularWeightFilter, {
  field: 'molecularWeight',
  operator: 'range',
  value: [100, 200],
})
assert.equal(validateFilter(molecularWeightFilter), true)

const invalidFieldFilter = createFilter({
  field: 'test',
  value: 'invalid',
})
assert.equal(invalidFieldFilter, null)

const emptyValueFilter = createFilter({
  field: 'formula',
  value: '   ',
})
assert.equal(emptyValueFilter, null)

const normalizedFilters = normalizeFilters([
  formulaFilter,
  formulaFilter,
  { field: 'molecularWeight', operator: 'range', value: [200, 100] },
  { field: 'test', operator: 'equals', value: 'invalid' },
])
assert.deepEqual(normalizedFilters, [
  formulaFilter,
  { field: 'molecularWeight', operator: 'range', value: [100, 200] },
])

console.log(JSON.stringify({
  createFilter: 'PASS',
  validateFilter: 'PASS',
  normalizeFilters: 'PASS',
  requiredCases: 5,
}, null, 2))
