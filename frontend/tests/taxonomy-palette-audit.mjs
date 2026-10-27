import assert from 'node:assert/strict'

import {
  HUMETA_CANONICAL_CATEGORIES,
  HUMETA_CATEGORY_PALETTE,
  getClassyfireRankBackground,
  getTaxonomyRankStyle,
  resolveHumetaCategory,
} from '../src/components/metabolite/taxonomyPalette.js'

const expectedPalette = {
  'Amino Acids': ['#B84F68', '#D98B9C', '#F3D6DE'],
  Carbohydrates: ['#25856C', '#67B79F', '#D5EEE6'],
  'Cofactors and Vitamins': ['#95711E', '#D1AF5A', '#F2E5BF'],
  Energy: ['#B65F29', '#E0925D', '#F5D9C3'],
  'Lipids: Fatty Acyls': ['#376FAE', '#759BC8', '#D9E5F2'],
  'Lipids: Glycerolipids': ['#1F828A', '#62B2B6', '#D3EDED'],
  'Lipids: Glycerophospholipids': ['#337F9D', '#73ACC1', '#D7EAF1'],
  'Lipids: Prenol lipids': ['#318371', '#70AD9C', '#D9ECE6'],
  'Lipids: Sphingolipids': ['#A54978', '#C47B9E', '#EED5E2'],
  'Lipids: Sterol Lipids': ['#7B4FA2', '#A27EBB', '#E7D9EF'],
  Nucleotides: ['#465FB4', '#7D8ECE', '#DCE2F5'],
  Peptides: ['#6955A4', '#9786BF', '#E4DDEF'],
  Xenobiotics: ['#71665F', '#A0968F', '#E7E1DD'],
}

function relativeLuminance(hex) {
  const channels = [1, 3, 5]
    .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((channel) => channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4))
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function contrastRatio(first, second) {
  const luminances = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a)
  return (luminances[0] + 0.05) / (luminances[1] + 0.05)
}

assert.deepEqual(HUMETA_CANONICAL_CATEGORIES, Object.keys(expectedPalette))

for (const category of HUMETA_CANONICAL_CATEGORIES) {
  assert.equal(resolveHumetaCategory(category), category)
  const [strong, medium, light] = expectedPalette[category]
  assert.deepEqual(HUMETA_CATEGORY_PALETTE[category], { strong, medium, light })
  assert.deepEqual(getTaxonomyRankStyle({ system: 'humeta', category, depth: 1, totalDepth: 3 }), { background: strong, color: '#FFFFFF' })
  assert.deepEqual(getTaxonomyRankStyle({ system: 'humeta', category, depth: 2, totalDepth: 3 }), { background: medium, color: '#0D2838' })
  assert.deepEqual(getTaxonomyRankStyle({ system: 'humeta', category, depth: 3, totalDepth: 3 }), { background: light, color: '#0D2838' })
  assert.ok(contrastRatio(strong, '#FFFFFF') >= 4.5, `${category} Strong must meet 4.5:1 with white`)
  assert.ok(contrastRatio(medium, '#0D2838') >= 4.5, `${category} Medium must meet 4.5:1 with dark blue-gray`)
  assert.ok(contrastRatio(light, '#0D2838') >= 4.5, `${category} Light must meet 4.5:1 with dark blue-gray`)

  const deepColors = [4, 6, 9].map((depth) => getTaxonomyRankStyle({
    system: 'humeta', category, depth, totalDepth: 9,
  }).background)
  assert.equal(new Set(deepColors).size, 3)
  assert.ok(deepColors.every((color) => color !== strong && color !== medium))
  assert.ok(deepColors.every((color) => contrastRatio(color, '#0D2838') >= 4.5))
  assert.ok(deepColors.every((color, index) => index === 0 || relativeLuminance(color) > relativeLuminance(deepColors[index - 1])))
}

assert.equal(resolveHumetaCategory('Amino acid and Peptides'), 'Amino Acids')
assert.equal(resolveHumetaCategory('amino'), null)
assert.equal(resolveHumetaCategory('Unknown category'), null)

const preservedHumetaFallbacks = {
  1: '#b8ddec',
  2: '#c0e1ee',
  3: '#c8e4f0',
  4: '#d0e8f2',
  6: '#e1f1f7',
  9: '#fbfdfe',
}

for (const [depth, expectedBackground] of Object.entries(preservedHumetaFallbacks)) {
  assert.deepEqual(
    getTaxonomyRankStyle({ system: 'humeta', category: 'Unknown category', depth: Number(depth), totalDepth: 9 }),
    { background: expectedBackground, color: '#3D6278' },
  )
}

const expectedClassyfireDepths = ['#79BEDB', '#91CBE2', '#A8D7E9', '#BCE2F0', '#D0EDF5']
for (const [index, expectedBackground] of expectedClassyfireDepths.entries()) {
  const depth = index + 1
  assert.equal(getClassyfireRankBackground(depth, 9), expectedBackground)
  assert.deepEqual(
    getTaxonomyRankStyle({ system: 'classyfire', category: 'Amino Acids', depth, totalDepth: 9 }),
    { background: expectedBackground, color: '#3D6278' },
  )
}

const deeperClassyfireColors = [6, 7, 8, 9].map((depth) => getClassyfireRankBackground(depth, 9))
assert.ok(deeperClassyfireColors.every((color, index) => index === 0 || relativeLuminance(color) > relativeLuminance(deeperClassyfireColors[index - 1])))

console.log('Taxonomy palette audit PASS: Humeta palette and fallback preserved; Classyfire depths 1-5 exact and deeper levels progressively lighter.')
