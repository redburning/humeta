export const ABOUT_DATA_ACCESS_DATE = '2026-08-05'

export const hmdbMetrics = Object.freeze([
  Object.freeze({ id: 'metabolites', value: 253245, icon: 'metabolites' }),
  Object.freeze({ id: 'biospecimens', value: 61, icon: 'biospecimens' }),
  Object.freeze({ id: 'spectra', value: 2732152, icon: 'spectra' }),
])

export const chebiHumanMetaboliteClassification = Object.freeze({
  release: 253,
  releaseDate: '2026-07-07',
  humanRoleEntities: 3038,
  classifiedEntities: 2932,
  hierarchy: Object.freeze([
    Object.freeze({
      id: 'lipids',
      value: 1053,
      children: Object.freeze([
        Object.freeze({ id: 'fattyAcids', value: 249 }),
        Object.freeze({ id: 'steroids', value: 290 }),
        Object.freeze({ id: 'otherLipids', value: 514 }),
      ]),
    }),
    Object.freeze({
      id: 'otherOrganic',
      value: 1807,
      children: Object.freeze([
        Object.freeze({ id: 'aminoAcids', value: 112 }),
        Object.freeze({ id: 'carbohydrates', value: 53 }),
        Object.freeze({ id: 'nucleobaseContaining', value: 75 }),
        Object.freeze({ id: 'otherOrganicAcids', value: 234 }),
        Object.freeze({ id: 'otherOrganicMolecules', value: 1333 }),
      ]),
    }),
    Object.freeze({ id: 'otherEntities', value: 72, children: Object.freeze([]) }),
  ]),
  method: Object.freeze({
    starRating: 3,
    requiredRole: 'CHEBI:77746 human metabolite or an is_a descendant role',
    requiredField: 'monoisotopic_mass',
    relationTypes: Object.freeze({ hasRole: 4, isA: 5 }),
    precedence: Object.freeze([
      'fatty acid',
      'steroid',
      'other lipid',
      'amino acid',
      'carbohydrate',
      'nucleobase-containing molecular entity',
      'other organic acid',
      'other organic molecular entity',
      'other entity',
    ]),
  }),
})

export const chebiHumanMetaboliteMassDistribution = Object.freeze({
  release: 253,
  includedEntities: 2912,
  excludedAbove1500Da: 20,
  unit: 'Da',
  range: Object.freeze([0, 1500]),
  boxplot: Object.freeze([2.02, 168.19, 289.13, 407.45, 1490.83]),
  bins: Object.freeze([
    Object.freeze({ lower: 0, upper: 100, count: 126 }),
    Object.freeze({ lower: 100, upper: 200, count: 870 }),
    Object.freeze({ lower: 200, upper: 300, count: 513 }),
    Object.freeze({ lower: 300, upper: 400, count: 645 }),
    Object.freeze({ lower: 400, upper: 500, count: 285 }),
    Object.freeze({ lower: 500, upper: 600, count: 141 }),
    Object.freeze({ lower: 600, upper: 700, count: 64 }),
    Object.freeze({ lower: 700, upper: 800, count: 45 }),
    Object.freeze({ lower: 800, upper: 900, count: 84 }),
    Object.freeze({ lower: 900, upper: 1000, count: 37 }),
    Object.freeze({ lower: 1000, upper: 1100, count: 42 }),
    Object.freeze({ lower: 1100, upper: 1200, count: 26 }),
    Object.freeze({ lower: 1200, upper: 1300, count: 20 }),
    Object.freeze({ lower: 1300, upper: 1400, count: 6 }),
    Object.freeze({ lower: 1400, upper: 1500, count: 8 }),
  ]),
})

export const aboutUsSources = Object.freeze([
  Object.freeze({
    id: 'hmdb-statistics',
    name: 'Human Metabolome Database — Database Statistics',
    url: 'https://hmdb.ca/statistics',
    accessed: ABOUT_DATA_ACCESS_DATE,
    usage: Object.freeze({
      zh: '顶部代谢物、样本类型与谱图统计。数字描述 HMDB Version 5.0，不是 Humeta 自有数据。',
      en: 'Top metabolite, biospecimen, and spectra metrics. These describe HMDB Version 5.0, not Humeta holdings.',
    }),
  }),
  Object.freeze({
    id: 'hmdb-5-paper',
    name: 'HMDB 5.0: the Human Metabolome Database for 2022',
    url: 'https://doi.org/10.1093/nar/gkab1062',
    accessed: ABOUT_DATA_ACCESS_DATE,
    citation: 'Nucleic Acids Research, 2022, 50(D1), D622–D631. DOI: 10.1093/nar/gkab1062',
    usage: Object.freeze({
      zh: '用于人体代谢知识范围、ChemFOnt 分类和证据类型的背景说明。',
      en: 'Background for the scope of human metabolite knowledge, ChemFOnt classification, and evidence types.',
    }),
  }),
  Object.freeze({
    id: 'chebi-release-253',
    name: 'ChEBI Release 253 — official flat files and ontology relations',
    url: 'https://ftp.ebi.ac.uk/pub/databases/chebi/flat_files/README',
    accessed: ABOUT_DATA_ACCESS_DATE,
    citation: 'ChEBI data is from https://www.ebi.ac.uk/chebi, Release 253, 2026-07-07.',
    usage: Object.freeze({
      zh: 'Sunburst 分类计数与单同位素质量分布；使用 compounds、chemical_data、relation 三张官方 TSV 表。',
      en: 'Sunburst class counts and monoisotopic-mass distribution from the official compounds, chemical_data, and relation TSV tables.',
    }),
  }),
  Object.freeze({
    id: 'chebi-about',
    name: 'ChEBI — Chemical Entities of Biological Interest',
    url: 'https://www.ebi.ac.uk/chebi/',
    accessed: ABOUT_DATA_ACCESS_DATE,
    usage: Object.freeze({
      zh: '化学实体、角色与本体关系的语义依据。',
      en: 'Semantic basis for chemical entities, roles, and ontology relations.',
    }),
  }),
  Object.freeze({
    id: 'metabolights',
    name: 'MetaboLights — metabolomics studies and derived information',
    url: 'https://www.ebi.ac.uk/metabolights/',
    accessed: ABOUT_DATA_ACCESS_DATE,
    usage: Object.freeze({
      zh: '公开代谢组学研究、实验元数据与可复用数据生态背景。',
      en: 'Context for public metabolomics studies, experimental metadata, and reusable data.',
    }),
  }),
  Object.freeze({
    id: 'pubchem',
    name: 'PubChem — chemical structure and identifier documentation',
    url: 'https://pubchem.ncbi.nlm.nih.gov/docs/quick-search',
    accessed: ABOUT_DATA_ACCESS_DATE,
    usage: Object.freeze({
      zh: '名称、结构、SMILES、InChI 与标识符互操作背景。',
      en: 'Context for names, structures, SMILES, InChI, and identifier interoperability.',
    }),
  }),
  Object.freeze({
    id: 'kegg',
    name: 'KEGG COMPOUND and PATHWAY',
    url: 'https://www.kegg.jp/kegg/compound/',
    accessed: ABOUT_DATA_ACCESS_DATE,
    usage: Object.freeze({
      zh: '代谢物、反应与通路语境的知识生态节点。',
      en: 'Knowledge-ecosystem node for compounds, reactions, and pathways.',
    }),
  }),
  Object.freeze({
    id: 'gnps',
    name: 'GNPS — Global Natural Products Social Molecular Networking',
    url: 'https://gnps.ucsd.edu/ProteoSAFe/static/gnps-splash.jsp',
    accessed: ABOUT_DATA_ACCESS_DATE,
    usage: Object.freeze({
      zh: '开放 MS/MS 谱图组织、共享与注释生态背景。',
      en: 'Context for open organization, sharing, and annotation of MS/MS spectra.',
    }),
  }),
  Object.freeze({
    id: 'msi-reporting',
    name: 'Metabolomics Standards Initiative — minimum reporting standards',
    url: 'https://doi.org/10.1007/s11306-007-0082-2',
    accessed: ABOUT_DATA_ACCESS_DATE,
    citation: 'Sumner et al., Metabolomics 3, 211–221 (2007). DOI: 10.1007/s11306-007-0082-2',
    usage: Object.freeze({
      zh: '样本制备、实验分析、质量控制、代谢物鉴定与数据预处理的报告原则。',
      en: 'Reporting principles for sample preparation, analysis, quality control, metabolite identification, and preprocessing.',
    }),
  }),
])
