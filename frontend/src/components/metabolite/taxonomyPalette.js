export const HUMETA_CANONICAL_CATEGORIES = Object.freeze([
  'Amino Acids',
  'Carbohydrates',
  'Cofactors and Vitamins',
  'Energy',
  'Lipids: Fatty Acyls',
  'Lipids: Glycerolipids',
  'Lipids: Glycerophospholipids',
  'Lipids: Prenol lipids',
  'Lipids: Sphingolipids',
  'Lipids: Sterol Lipids',
  'Nucleotides',
  'Peptides',
  'Xenobiotics',
])

export const HUMETA_CATEGORY_PALETTE = Object.freeze({
  'Amino Acids': Object.freeze({ strong: '#B84F68', medium: '#D98B9C', light: '#F3D6DE' }),
  Carbohydrates: Object.freeze({ strong: '#25856C', medium: '#67B79F', light: '#D5EEE6' }),
  'Cofactors and Vitamins': Object.freeze({ strong: '#95711E', medium: '#D1AF5A', light: '#F2E5BF' }),
  Energy: Object.freeze({ strong: '#B65F29', medium: '#E0925D', light: '#F5D9C3' }),
  'Lipids: Fatty Acyls': Object.freeze({ strong: '#376FAE', medium: '#759BC8', light: '#D9E5F2' }),
  'Lipids: Glycerolipids': Object.freeze({ strong: '#1F828A', medium: '#62B2B6', light: '#D3EDED' }),
  'Lipids: Glycerophospholipids': Object.freeze({ strong: '#337F9D', medium: '#73ACC1', light: '#D7EAF1' }),
  'Lipids: Prenol lipids': Object.freeze({ strong: '#318371', medium: '#70AD9C', light: '#D9ECE6' }),
  'Lipids: Sphingolipids': Object.freeze({ strong: '#A54978', medium: '#C47B9E', light: '#EED5E2' }),
  'Lipids: Sterol Lipids': Object.freeze({ strong: '#7B4FA2', medium: '#A27EBB', light: '#E7D9EF' }),
  Nucleotides: Object.freeze({ strong: '#465FB4', medium: '#7D8ECE', light: '#DCE2F5' }),
  Peptides: Object.freeze({ strong: '#6955A4', medium: '#9786BF', light: '#E4DDEF' }),
  Xenobiotics: Object.freeze({ strong: '#71665F', medium: '#A0968F', light: '#E7E1DD' }),
})

const CATEGORY_ALIASES = Object.freeze({
  ...Object.fromEntries(HUMETA_CANONICAL_CATEGORIES.map((category) => [category, category])),
  'Amino acid and Peptides': 'Amino Acids',
})

const fallbackRankStartColor = [184, 221, 236]
const fallbackShortHierarchyEndColor = [226, 243, 250]
const fallbackMediumHierarchyEndColor = [243, 250, 253]
const fallbackLongHierarchyEndColor = [251, 253, 254]
const classyfireDepthPalette = Object.freeze([
  '#79BEDB',
  '#91CBE2',
  '#A8D7E9',
  '#BCE2F0',
  '#D0EDF5',
])
const humetaStrongForeground = '#FFFFFF'
const humetaLightForeground = '#0D2838'
const defaultRankForeground = '#3D6278'

function toHex(channel) {
  return Math.round(channel).toString(16).padStart(2, '0')
}

function mixWithWhite(hex, amount) {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16))
  return `#${channels.map((channel) => toHex(channel + (255 - channel) * amount)).join('')}`
}

function getDeepLevelWhiteMix(depth) {
  if (depth === 4) return 0.25
  if (depth === 5) return 0.45
  if (depth === 6) return 0.65
  return Math.min(0.65 + (depth - 6) * 0.1, 0.92)
}

export function resolveHumetaCategory(value) {
  return typeof value === 'string' ? CATEGORY_ALIASES[value] ?? null : null
}

function getFallbackRankBackground(depth, totalDepth) {
  const normalizedTotalDepth = Math.max(Math.floor(totalDepth), 1)
  const normalizedDepth = Math.min(Math.max(Math.floor(depth), 1), normalizedTotalDepth)
  const endColor = normalizedTotalDepth <= 3
    ? fallbackShortHierarchyEndColor
    : normalizedTotalDepth <= 5
      ? fallbackMediumHierarchyEndColor
      : fallbackLongHierarchyEndColor
  const progress = normalizedTotalDepth === 1
    ? 0
    : (normalizedDepth - 1) / (normalizedTotalDepth - 1)
  const easedProgress = Math.pow(progress, 1.05)

  return `#${fallbackRankStartColor.map((start, index) => toHex(start + (endColor[index] - start) * easedProgress)).join('')}`
}

export function getClassyfireRankBackground(depth) {
  const normalizedDepth = Math.max(Math.floor(depth), 1)
  if (normalizedDepth <= classyfireDepthPalette.length) {
    return classyfireDepthPalette[normalizedDepth - 1]
  }

  const whiteMix = Math.min(0.22 + (normalizedDepth - 6) * 0.12, 0.92)
  return mixWithWhite(classyfireDepthPalette[classyfireDepthPalette.length - 1], whiteMix)
}

export function getTaxonomyRankStyle({ system, category, depth, totalDepth }) {
  const normalizedDepth = Math.max(Math.floor(depth), 1)
  const palette = system === 'humeta'
    ? HUMETA_CATEGORY_PALETTE[resolveHumetaCategory(category)]
    : null

  if (!palette) {
    return {
      background: system === 'humeta'
        ? getFallbackRankBackground(normalizedDepth, totalDepth)
        : getClassyfireRankBackground(normalizedDepth),
      color: defaultRankForeground,
    }
  }

  const background = normalizedDepth === 1
    ? palette.strong
    : normalizedDepth === 2
      ? palette.medium
      : normalizedDepth === 3
        ? palette.light
        : mixWithWhite(palette.light, getDeepLevelWhiteMix(normalizedDepth))

  return {
    background,
    color: normalizedDepth === 1 ? humetaStrongForeground : humetaLightForeground,
  }
}
