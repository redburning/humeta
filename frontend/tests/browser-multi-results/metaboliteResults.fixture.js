const chineseNames = [
  '色氨酸测试物',
  '超长中文名称代谢物验证记录',
  '葡萄糖衍生物',
  '脂质测试分子',
  '氨基酸类似物',
]

const categories = ['Amino acid', 'Lipid', 'Carbohydrate', 'Organic acid', 'Nucleotide']

const normalSmiles = 'N[C@@H](CC1=CC=CC=C1)C(=O)O'
const longSmiles = [
  'CC(C)C[C@@H](N)C(=O)N[C@@H](CC1=CC=C(O)C=C1)C(=O)',
  'N[C@@H](CC2=CN=CN2)C(=O)O.CCOC(=O)N[C@@H](CO)',
  'C1=CC=C2C(=C1)C(=CN2)C[C@@H](C(=O)O)N',
].join('')

function structureImage(index) {
  const dimensions = [
    { width: 320, height: 140 },
    { width: 220, height: 220 },
    { width: 160, height: 300 },
  ]
  const { width, height } = dimensions[index % dimensions.length]
  const stroke = ['#087fbe', '#216b8d', '#3b7f72'][index % 3]
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="white"/>
      <g fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M ${width * 0.12} ${height * 0.52} L ${width * 0.28} ${height * 0.28} L ${width * 0.46} ${height * 0.48} L ${width * 0.64} ${height * 0.26} L ${width * 0.84} ${height * 0.5}"/>
        <path d="M ${width * 0.28} ${height * 0.28} L ${width * 0.3} ${height * 0.76} L ${width * 0.6} ${height * 0.78} L ${width * 0.64} ${height * 0.26}"/>
      </g>
      <g fill="#173b4d" font-family="Arial, sans-serif" font-size="${Math.max(12, Math.min(width, height) * 0.1)}">
        <text x="${width * 0.06}" y="${height * 0.55}">HO</text>
        <text x="${width * 0.84}" y="${height * 0.55}">NH₂</text>
      </g>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function metaboliteName(index) {
  if (index === 2) {
    return 'Test Ultra Long Metabolite Name for Browser Database Card Wrapping Validation'
  }
  if (index <= 16) return `Test Metabolite ${String(index).padStart(2, '0')}`
  return `Database Metabolite ${String(index).padStart(2, '0')}`
}

export const metaboliteResults = Array.from({ length: 50 }, (_, offset) => {
  const index = offset + 1
  return {
    key: `browser-test-result-${index}`,
    id: `IPTM9${String(index).padStart(4, '0')}`,
    name: metaboliteName(index),
    chineseName: chineseNames[offset % chineseNames.length],
    cas: `900${String(index).padStart(2, '0')}-${index % 90}-0`,
    formula: `C${8 + (index % 18)}H${10 + (index % 24)}N${index % 5}O${2 + (index % 7)}`,
    monoisotopicMw: (150.045 + index * 3.217).toFixed(5),
    category: categories[offset % categories.length],
    smiles: index % 4 === 0 ? longSmiles : normalSmiles,
    structureImage: structureImage(offset),
  }
})
