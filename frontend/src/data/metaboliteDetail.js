const metadata = (entries) => entries.map(([label, value]) => ({ label, value }))

const trajectoryMetadata = () => [
  {
    label: 'Status:',
    values: ['Absolute Quantified', 'Quantified', 'Semi-quantified', 'Relative quantified'],
  },
  { label: 'Analytical Method:', value: 'LC-MS/MS' },
  { label: 'Calibration type:', value: 'SIL internal standard' },
  { label: 'SRM transition:', value: '205 > 146' },
  { label: 'Instrument:', value: 'SCIEX 5500+' },
  { label: 'Contributor:', value: 'IPT' },
  { label: 'Creation time:', value: '2024-10' },
  { label: 'Modified time:', value: '2024-10' },
]

const diseaseNames = [
  'Kidney disease', 'Fatty liver disease', 'Pregnancy', 'Liver cancer',
  "Alzheimer's disease", 'Obesity', 'Type 2 diabetes', "Parkinson's disease",
  'Major depressive disorder', 'Inflammatory bowel disease', 'Colorectal cancer',
  'Cardiovascular disease', 'Chronic kidney disease', 'Insulin resistance',
  'Metabolic syndrome', 'Acute liver injury', 'Celiac disease', 'Crohn disease',
  'Ulcerative colitis', 'Hypertension', 'Atherosclerosis', 'Heart failure',
  'Autism spectrum disorder', 'Schizophrenia', 'Bipolar disorder', 'Anxiety disorder',
  'Migraine', 'Epilepsy', 'Sleep disorder', 'Melanoma', 'Breast cancer',
  'Pancreatic cancer', 'Gastric cancer', 'Prostate cancer', 'Osteoporosis',
  'Rheumatoid arthritis', 'Systemic inflammation', 'Sepsis', 'Asthma', 'Psoriasis',
]

export const metaboliteDetails = {
  IPTM00001: {
    id: 'IPTM00001',
    heroLabel: 'Metabolite Name',
    name: 'Tryptophan',
    chineseName: '色氨酸',
    identifiers: [
      { label: 'Humeta', value: 'IPTM00001' },
      { label: 'Structural Hierarchy', value: 'Isomeric substructural level' },
      { label: 'Primary biological locations', value: 'human biofluids (blood & urine)' },
      { label: 'Preferred detection mode', value: 'positive (ESI+)' },
      { label: 'CAS Number', value: '73-22-3' },
      { label: 'PubChem', value: '6305' },
      { label: 'HMDB', value: 'HMDB0000929' },
      { label: 'KEGG', value: 'C00078' },
      { label: 'LIPID MAPS', value: '/' },
      { label: 'SwissLipids', value: 'SLM:000501423' },
      { label: 'ChEBI', value: 'CHEBI:16828' },
      { label: 'Common Abbreviations', value: 'L-Trp' },
      { label: 'HMDB name (2026V5)', value: 'L-Tryptophan' },
      { label: 'Metabolon name (2022NC)', value: 'tryptophan' },
      {
        label: 'Common Synonyms',
        value: 'L-Tryptophane; (S)-Tryptophan; (2S)-2-amino-3-(1H-indol-3-yl)propanoic acid; Ardeytropin; Indole-3-alanine; L-(-)-Tryptophan; 3-Indol-3-ylalanine; 2-Amino-3-indolylpropanoic acid',
        wide: true,
      },
      {
        label: 'Chinese Synonyms',
        value: '(S)-2-氨基-3-(1H-吲哚-3-基)丙酸; L-胰化蛋白氨基酸; β-吲哚基丙氨酸; L-氨基吲哚丙酸',
        wide: true,
      },
    ],
    overview: {
      label: 'Biochemical Origin:',
      value: 'Endogenous, Amino acid metabolism',
      description: [
        '胆红素降解终产物BOX-A及其位置异构体BOX-B(分子式C9H10N2O2)，以及另一对位置异构体BOX-C和BOX-D(分子式C10H12N2O4)，均为胆红素和胆绿素在体内氧化终产物(BOXes)。前两者发现较早，后两者在2020年前后才见诸于报道。结构上，它们都是单吡咯类化合物，由四吡咯前体经三吡咯(胆红素降解三吡咯-A和-B)和二吡咯(胆红素降解二吡咯propentdyopent A1、B1、B2)中间体逐步降解而来。作为血红素的高阶降解产物，BOX-A和BOX-B被认为是黄疸及肝衰竭中肝细胞损伤的重要介质。它们在健康人血清中的浓度约为20–30 nM，在肝衰竭患者中可显著升高至约500 nM。据德国团队的最新研究，BOX-A和BOX-B在药代动力学特征(半衰期、胆汁排泄)、肝细胞骨架重构效应以及核受体调控功能(Rev-erbα vs. Rev-erbβ)等方面表现出明显差异。两者均显著抑制胆汁酸合成关键酶CYP7A1的表达。基于Humeta的非靶向代谢组学实验数据，它们在PQ2000中国参考血清和胆汁样本中可被检出，但峰强度较低。',
        'BOX-A, as well as its regio-isomers BOX-B with formula C9H10N2O2, and the other regio-isomer pair BOX-C and BOX-D with formula C10H12N2O4, are all end-products of bilirubin and biliverdin oxidation (BOX) in vivo. The former two have been known earlier than the latter two, which were reported around 2020. Structurally, they are single-pyrrole metabolites derived from tetrapyrrole precursors through tripyrrole (biotripyrrin-A and biotripyrrin-B) and bipyrrole (propentdyopent A1, B1, and B2) as intermediates. As higher-order heme degradation products, BOX-A and BOX-B are recognized as important mediators of liver cell damage in jaundice and liver failure. They are detected at 20–30 nM concentration levels in healthy human sera, yet substantially increase to ~500 nM in liver failure patients. According to the latest investigation by a German team, BOX-A and BOX-B exhibit distinct pharmacodynamic characteristics (half-life, biliary excretion), effects on hepatocellular cytoskeleton remodeling, and nuclear receptor regulation (Rev-erbα vs. Rev-erbβ). They both significantly inhibit the expression of CYP7A1, the key enzyme involved in bile acid synthesis. Based on Humeta’s untargeted metabolomics experimental data, they can be detected in Chinese reference serum PQ2000 and bile samples, but with quite low peak intensity. (Humeta)',
      ],
    },
    chemicalDescription: {
      rows: [
        [
          { label: 'Formula', value: 'C11H12N2O2' },
          { label: 'Charge State', value: '0' },
        ],
        [
          { label: 'Monoisotopic Mass', value: '204.089878' },
          { label: 'Average Mass', value: '204.22526' },
        ],
        [{ label: 'IUPAC Name', value: '(2S)-2-amino-3-(1H-indol-3-yl)propanoic acid' }],
        [{ label: 'InChI Key', value: 'QIVBCDIJIAJPQS-VIFPVBQESA-N' }],
        [{ label: 'SMILES', value: 'C1=CC=C2C(=C1)C(=CN2)C[C@@H](C(=O)O)N' }],
        [{ label: 'Universal SMILES', value: 'c1ccc2c(c1)c(c[nH]2)C[C@@H](C(=O)O)N' }],
        [
          { label: 'ALogP', value: '1.1223' },
          { label: 'Molecular Refractivity', value: '57.6139' },
        ],
        [
          { label: 'Num H-Bond Donors', value: '3' },
          { label: 'Num H-Bond Acceptors', value: '2' },
        ],
        [
          { label: 'Topological PSA', value: '79.11' },
          { label: 'Fraction Csp3', value: '0.1818' },
        ],
        [
          { label: 'Num Rotatable Bonds', value: '3' },
          { label: 'Num Aromatic Rings', value: '2' },
        ],
        [
          { label: 'Number of Heavy Atoms', value: '15' },
          { label: 'Number of Rings', value: '2' },
        ],
        [
          { label: 'Num Chiral Centers', value: '1' },
          { label: 'Num Aliphatic Rings', value: '0' },
        ],
        [
          { label: "Violations of Lipinski's Rule", value: '0' },
          { label: "Violations of Veber's Rules", value: '0' },
        ],
      ],
      structureImage: '/images/tryptophan-structure.svg',
      structureAlt: 'Tryptophan 2D chemical structure',
      structureDownloadName: 'tryptophan-structure.svg',
    },
    taxonomy: [
      {
        id: 'np-classifier',
        title: 'NP Classifier',
        tree: {
          id: 'np-pathway', rank: 'Human Metabolism Superclass', label: 'Amino acid and Peptides', children: [{
            id: 'np-small-peptides', rank: 'Biochemical Class', label: 'Small Peptides', children: [{
              id: 'np-amino-acids', rank: 'Metabolic subpathway', label: 'Amino acids', children: [],
            }],
          }],
        },
      },
      {
        id: 'classifier',
        title: 'Classifier',
        tree: {
          id: 'classifier-kingdom', rank: 'Kingdom', label: 'Organic compounds', children: [{
            id: 'classifier-superclass', rank: 'Superclass', label: 'Organic acids and derivatives', children: [{
              id: 'classifier-class', rank: 'Class', label: 'Carboxylic acids and derivatives', children: [{
                id: 'classifier-subclass', rank: 'Subclass', label: 'Amino acids, peptides, and analogues', children: [{
                  id: 'classifier-level-5', rank: 'Parent Level 1', label: 'Peptides', children: [{
                    id: 'classifier-level-6', rank: 'Parent Level 2', label: 'Dipeptides', children: [{
                      id: 'classifier-parent-level-3', rank: 'Parent Level 3', label: '', children: [{
                        id: 'classifier-parent-level-4', rank: 'Parent Level 4', label: '', children: [{
                          id: 'classifier-parent-level-5', rank: 'Parent Level 5', label: '', children: [{
                            id: 'classifier-parent-level-6', rank: 'Parent Level 6', label: '', children: [],
                          }],
                        }],
                      }],
                    }],
                  }],
                }],
              }],
            }],
          }],
        },
      },
    ],
    spectra: {
      positive: {
        id: 'positive-spectrum', title: 'Positive MS/MS', color: '#167fbd',
        peaks: [[41.04, 7], [77.04, 14], [91.05, 9], [118.06, 34], [130.07, 16], [132.08, 100], [146.06, 42], [159.09, 12], [188.07, 62], [205.10, 18]],
        metadata: metadata([
          ['Precursor Ion', '[M+H], 204.1223'], ['Ionization', 'Heated ESI'],
          ['MS Analyzer', 'Q Active Orbitrap'], ['Resolution', '17500 FWHM@m/z 200'],
          ['Fragmentation', 'HCD, Nitrogen'], ['Collision Energy', 'Stepped NCE, 15%+30%+45%'],
          ['Creation time', '10 Dec, 2023'],
        ]),
      },
      negative: {
        id: 'negative-spectrum', title: 'Negative MS/MS', color: '#6354a8',
        peaks: [[59.01, 8], [74.02, 15], [91.05, 12], [116.05, 100], [128.05, 30], [142.07, 22], [158.06, 10], [186.06, 54], [203.08, 24]],
        metadata: metadata([
          ['Precursor Ion', '[M-H], 202.2352'], ['Ionization', 'Heated ESI'],
          ['MS Analyzer', 'Q Active Orbitrap'], ['Resolution', '17500 FWHM@m/z 200'],
          ['Fragmentation', 'HCD, Nitrogen'], ['Collision Energy', 'Stepped NCE, 15%+30%+45%'],
          ['Creation time', '10 Dec, 2023'],
        ]),
      },
    },
    tissueDistribution: {
      labels: ['Brain', 'Liver', 'Kidney', 'Heart', 'Lung', 'Muscle', 'Intestine', 'Pancreas', 'Spleen', 'Adipose'],
      modes: {
        Tissue: [42, 86, 63, 34, 29, 51, 78, 39, 44, 58],
        Comparison: [31, 69, 55, 47, 35, 72, 62, 51, 38, 66],
      },
      // Demonstration values for front-end visualization only.
      // Replace with validated concentration data when available.
      concentration: {
        metric: 'Concentration',
        sourceType: 'demonstration',
        description: 'Demonstration visualization data.',
        values: [6400, 18400, 12100, 5200, 7600, 14300, 21600, 9800, 6700, 16200],
      },
    },
    biofluidConcentrations: [
      {
        id: 'human-plasma', title: 'Human Plasma', color: '#d84b61',
        metric: 'Concentration', unit: 'nmol/L', sourceType: 'demonstration',
        yScale: { type: 'log', min: 0.1, max: 10000000 },
        // Fixed local demonstration curve. Replace with validated concentration data when available.
        curve: [
          { position: 0, value: 0.18 }, { position: 1, value: 0.46 },
          { position: 2, value: 1.4 }, { position: 3, value: 5.8 },
          { position: 4, value: 22 }, { position: 5, value: 68 },
          { position: 6, value: 150 }, { position: 7, value: 260 },
          { position: 8, value: 360 }, { position: 9, value: 480 },
          { position: 10, value: 760 }, { position: 11, value: 1800 },
          { position: 12, value: 6200 }, { position: 13, value: 24000 },
          { position: 14, value: 92000 }, { position: 15, value: 340000 },
          { position: 16, value: 980000 },
        ],
        highlightIndex: 8,
        tags: [],
        metadata: metadata([
          ['Status:', ['Absolute Quantified', 'Quantified', 'Semi-quantified', 'Relative quantified']],
          ['Analytical Method:', 'LC-MS/MS'],
          ['Calibration type:', 'SIL internal standard'],
          ['SRM transition:', '205 > 146'],
          ['Instrument:', 'SCIEX 5500+'],
          ['Contributor:', 'IPT'],
          ['Creation time:', '2024-10'],
          ['Modified time:', '2024-10'],
        ]),
      },
      {
        id: 'human-urine', title: 'Human Urine', color: '#36a46a',
        metric: 'Concentration', unit: 'nmol/L', sourceType: 'demonstration',
        yScale: { type: 'log', min: 0.1, max: 10000000 },
        // Independent fixed local demonstration curve; it is not derived from the former percentile values.
        curve: [
          { position: 0, value: 0.12 }, { position: 1, value: 0.38 },
          { position: 2, value: 1.1 }, { position: 3, value: 4.6 },
          { position: 4, value: 18 }, { position: 5, value: 54 },
          { position: 6, value: 128 }, { position: 7, value: 230 },
          { position: 8, value: 330 }, { position: 9, value: 460 },
          { position: 10, value: 820 }, { position: 11, value: 2200 },
          { position: 12, value: 7800 }, { position: 13, value: 31000 },
          { position: 14, value: 120000 }, { position: 15, value: 430000 },
          { position: 16, value: 1200000 },
        ],
        highlightIndex: 8,
        tags: [],
        metadata: metadata([
          ['Status:', ['Absolute Quantified', 'Quantified', 'Semi-quantified', 'Relative quantified']],
          ['Analytical Method:', 'LC-MS/MS'],
          ['Calibration type:', 'SIL internal standard'],
          ['SRM transition:', '205 > 146'],
          ['Instrument:', 'SCIEX 5500+'],
          ['Contributor:', 'IPT'],
          ['Creation time:', '2024-10'],
          ['Modified time:', '2024-10'],
        ]),
      },
    ],
    trajectories: [
      {
        id: 'endurance-training', title: 'Short-term trajectory during endurance training', color: '#268ac3',
        x: ['T0', 'T1', 'T2', 'T3', 'T4'], values: [20000, 30000, 16000, 58000, 22000],
        yAxis: { min: 0, max: 80000, interval: 20000 },
        tags: [],
        metadata: trajectoryMetadata(),
      },
      {
        id: 'longevity', title: 'Longevity trajectory', color: '#6c62b3',
        x: ['Y1-10', 'Y10-20', 'Y20-30', 'Y30-40', 'Y40-50', 'Y50-60', 'Y60-70', 'Y70-80', 'Y80-90', 'Y90-100'],
        values: [50, 110, 50, 180, 55, 105, 260, 60, 130, 105],
        yAxis: { min: 0, max: 300, interval: 100 },
        tags: [],
        metadata: trajectoryMetadata(),
      },
    ],
    diseaseAssociation: {
      title: 'Metabolite-Disease Association Pairs Database(2026v1)',
      categories: ['Metabolic', 'Neurological', 'Cancer', 'Inflammatory'],
      diseases: diseaseNames.map((name, index) => ({
        id: `disease-${index + 1}`,
        name,
        category: index % 4,
      })),
      associatedDiseases: diseaseNames.slice(0, 12),
    },
    pathway: {
      title: 'Human Tryptophan metabolism',
      image: '/images/metabolite-detail/tryptophan-metabolism-pathway.svg',
      description: 'This pathway figure is provided for visualization of human tryptophan metabolism. Detailed pathway annotation will be connected to the database service in a later stage.',
    },
  },
}

