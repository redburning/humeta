import assert from 'node:assert/strict'
import { getDiseaseAssociationContent } from '../src/data/diseaseAssociationContent.js'

const known = getDiseaseAssociationContent('IPTM00001')
assert.equal(known.type, 'image')
assert.equal(known.src, '/disease-association/IPTM00001/preview.jpg')
assert.equal(known.alt, 'Disease Association visualization for IPTM00001')

const normalized = getDiseaseAssociationContent('  iptm00001  ')
assert.equal(normalized.type, 'image')
assert.equal(normalized.src, known.src)

assert.deepEqual(getDiseaseAssociationContent('IPTM00002'), { type: 'none' })
assert.deepEqual(getDiseaseAssociationContent('UNKNOWN'), { type: 'none' })
assert.deepEqual(getDiseaseAssociationContent(undefined), { type: 'none' })

console.log('Disease Association content mapping audit passed.')
