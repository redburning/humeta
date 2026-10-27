import { hmdbMetrics } from './aboutUsScientificData.js'

export const contactDetails = Object.freeze({
  brand: 'iPhenome',
  phone: '0411-822871171',
  email: 'marcom@imetabolomics.cn',
})

const metricsById = Object.freeze(
  Object.fromEntries(hmdbMetrics.map((metric) => [metric.id, metric])),
)

export const aboutUsContent = Object.freeze({
  zh: Object.freeze({
    documentLanguage: 'zh-CN',
    locale: 'zh-CN',
    pageTitle: '关于 Humeta',
    pageKicker: 'Human metabolome knowledge · spectral evidence · scientific context',
    languageSwitch: Object.freeze({
      ariaLabel: '切换 About 页面语言',
      chinese: '中文',
      english: 'English',
    }),
    statistics: Object.freeze({
      title: '人体代谢知识的公开参照尺度',
      ariaLabel: '来自 Human Metabolome Database Version 5.0 的三项公开统计',
      locale: 'zh-CN',
      items: Object.freeze([
        Object.freeze({ ...metricsById.metabolites, label: 'HMDB 代谢物条目', detail: 'Total metabolites' }),
        Object.freeze({ ...metricsById.biospecimens, label: '不同生物样本类型', detail: 'Different biospecimens' }),
        Object.freeze({ ...metricsById.spectra, label: 'NMR、GC-MS 或 MS/MS 谱图', detail: 'Reference spectra' }),
      ]),
      sourceLabel: 'HMDB Database Statistics',
      sourceUrl: 'https://hmdb.ca/statistics',
      disclaimer: '访问日期：2026-08-05。以上数字来自 HMDB Version 5.0 官方统计，用于说明公开人体代谢知识资源的参照尺度，不代表 Humeta 自有数据量。',
    }),
    welcome: Object.freeze({
      eyebrow: '人体代谢知识与证据的连接层',
      title: '欢迎来到 Humeta',
      paragraphs: Object.freeze([
        '人体代谢组记录了内源代谢、饮食、药物、微生物及环境暴露共同作用后的化学表型。它比单一分子清单更依赖语境：同一个化学实体需要同时放回结构类别、生物样本、代谢通路、浓度范围与疾病背景中理解。',
        '质谱为这一知识体系提供可复核的实验入口。精确质量和分子式能够缩小候选空间，MS/MS 碎片谱则补充结构线索；名称、InChIKey、SMILES、HMDB、ChEBI 与 PubChem 标识符帮助不同资源之间稳定对齐。任何单一字段都不等同于完整鉴定。',
        'Humeta 的定位，是把代谢物实体、化学分类、光谱证据和人体样本语境组织成清晰的研究入口。页面中的分类图使用 ChEBI Release 253 的高置信人类代谢物角色实体，展示注释参考空间，而不是把站内功能包装成科研数据。',
      ]),
    }),
    philosophy: Object.freeze({
      eyebrow: '从候选信号到可解释证据',
      title: '使命与科学理念',
      paragraphs: Object.freeze([
        '代谢物注释不是一次搜索命中，而是多类证据的汇合。化学结构约束候选的组成与连接方式，实验谱图描述离子化与碎裂行为，人体知识语境则回答它是否曾在特定体液、组织、通路或生理状态中被观察。',
        'Humeta 强调证据可追溯：原始数据、处理参数、标识符映射、参考谱来源和注释等级应当能够被复查。数据库记录可以支持候选生成和证据汇总，但不能替代同条件标准品、正交实验或研究者的专业判断。',
        '平台建设遵循克制边界。这里呈现的是研究信息与公开资源之间的组织方式，不提供临床诊断，也不把“存在数据库链接”解释为生物学因果或确定鉴定。',
      ]),
    }),
    development: Object.freeze({
      eyebrow: '可复核的参考化学空间',
      title: '科研数据支撑',
      paragraphs: Object.freeze([
        '质量分布图来自 ChEBI Release 253。我们筛选具有 human metabolite 或其下位角色、3-star 评级且含单同位素质量的实体，共得到 2,932 条高置信记录；其中 2,912 条不超过 1,500 Da，用于直方图和箱线摘要。',
        '这一分布描述的是 ChEBI 中可用于人体代谢注释的参考化学实体，而不是受试者样本中的丰度、检出频率或疾病差异。20 条大于 1,500 Da 的记录仅为保持图形尺度可读而从分布图中排除，分类图仍保留全部 2,932 条记录。',
        '科研数据支撑还需要样本元数据、质控、峰提取与对齐参数、离子模式、碰撞能、参考谱版本及注释置信度。只有把这些信息与结构、质量和光谱共同保存，结果才更容易解释、复现与复用。',
      ]),
    }),
    guides: Object.freeze({
      eyebrow: '标识符、证据、语境与标准',
      title: '知识生态与引用规范',
      introduction: '人体代谢知识并不存在于单一数据库中。Humeta 关注的是这些资源之间如何通过稳定标识符、实验谱图和生物学语境建立可追溯连接。',
      entries: Object.freeze([
        Object.freeze({
          number: '01',
          label: '先对齐化学实体',
          description: '名称可能存在同义词和立体化学歧义；应尽量同时保留数据库 ID、InChIKey、SMILES、分子式与质量。',
        }),
        Object.freeze({
          number: '02',
          label: '再组织实验依据',
          description: '记录离子模式、加合物、仪器与碰撞条件，并区分精确质量候选、谱库匹配和标准品确认。',
        }),
        Object.freeze({
          number: '03',
          label: '最后补足人体语境',
          description: '将实体放回血清、血浆、尿液等生物样本，以及通路、疾病和研究设计中解释。',
        }),
      ]),
      boundaryTitle: '使用边界',
      boundary: 'Humeta 当前页面用于科研信息组织与前端交互验证。公开数据库记录和图表只能支持探索与候选解释，不构成正式代谢物鉴定、疾病诊断、治疗建议或临床决策。',
      citationTitle: '引用原则',
      citation: '使用图中数据时应优先引用原始数据库、具体版本和相关论文。ChEBI 图表注明 Release 253 与处理规则；HMDB 指标注明官方 Statistics 页面和访问日期。Humeta 不替代原始资源的正式引用。',
      sourcesTitle: '数据来源与方法',
      sourcesIntroduction: '以下链接为本页数字、图表和科学表述的直接来源或语义依据，均在 2026-08-05 核验。',
      sourcesVerifiedLabel: '最近核验日期',
      sourcesMethodSummary: '页面统计来自 HMDB 官方 Statistics；分类和质量分布由 ChEBI Release 253 官方平面文件按已记录规则派生。',
      sourcesOwnership: 'Humeta 不拥有 HMDB、ChEBI、MSI 或其他外部数据库数据；使用时应引用原始资源、版本和相关论文。',
      viewSourcesLabel: '查看全部数据来源',
      hideSourcesLabel: '收起详细数据来源',
      sourceLinkLabel: '访问来源',
      contactTitle: '联系信息',
      prefooterLabel: '使用边界、引用原则与联系信息',
      contact: Object.freeze({
        positioning: '质谱多组学科技服务与临床转化',
        addressLines: Object.freeze(['大连高新技术产业园区信达街57号', '生命科学产业园']),
        note: '正式数据发布、服务能力与 Humeta 引用格式以公司后续确认版本为准。',
      }),
    }),
  }),
  en: Object.freeze({
    documentLanguage: 'en',
    locale: 'en-US',
    pageTitle: 'About Humeta',
    pageKicker: 'Human metabolome knowledge · spectral evidence · scientific context',
    languageSwitch: Object.freeze({
      ariaLabel: 'Switch the About page language',
      chinese: '中文',
      english: 'English',
    }),
    statistics: Object.freeze({
      title: 'A public reference scale for human metabolome knowledge',
      ariaLabel: 'Three public statistics from Human Metabolome Database Version 5.0',
      locale: 'en-US',
      items: Object.freeze([
        Object.freeze({ ...metricsById.metabolites, label: 'HMDB metabolite entries', detail: 'Total metabolites' }),
        Object.freeze({ ...metricsById.biospecimens, label: 'Different biospecimen types', detail: 'Biological contexts' }),
        Object.freeze({ ...metricsById.spectra, label: 'NMR, GC-MS, or MS/MS spectra', detail: 'Reference spectra' }),
      ]),
      sourceLabel: 'HMDB Database Statistics',
      sourceUrl: 'https://hmdb.ca/statistics',
      disclaimer: 'Accessed 2026-08-05. These figures are official HMDB Version 5.0 statistics and provide context for public human-metabolome knowledge; they are not Humeta holdings.',
    }),
    welcome: Object.freeze({
      eyebrow: 'A connection layer for human metabolite knowledge and evidence',
      title: 'Welcome to Humeta',
      paragraphs: Object.freeze([
        'The human metabolome is a chemical phenotype shaped by endogenous metabolism, diet, medicines, microbes, and environmental exposure. It is more than a compound list: every entity gains meaning through chemical class, biospecimen, pathway, concentration, and disease context.',
        'Mass spectrometry provides an experimentally reviewable entry point. Accurate mass and formula constrain candidates, while MS/MS fragments add structural evidence. Names, InChIKey, SMILES, and HMDB, ChEBI, or PubChem identifiers keep records aligned across resources. No single field is a complete identification.',
        'Humeta is intended to organize metabolite entities, chemical classification, spectral evidence, and human biospecimen context into a clear research entry point. The classification chart uses high-confidence human-metabolite-role entities from ChEBI Release 253 rather than presenting website features as scientific data.',
      ]),
    }),
    philosophy: Object.freeze({
      eyebrow: 'From candidate signals to interpretable evidence',
      title: 'Our Mission & Scientific Philosophy',
      paragraphs: Object.freeze([
        'Metabolite annotation is not a single search hit; it is a convergence of evidence. Chemical structure constrains composition and connectivity, spectra describe ionization and fragmentation, and human knowledge asks whether an entity has been observed in a relevant biofluid, tissue, pathway, or physiological state.',
        'Humeta emphasizes traceability. Raw data, processing parameters, identifier mapping, reference-spectrum provenance, and annotation confidence should remain reviewable. Database records support candidate generation and evidence synthesis, but do not replace authentic standards, orthogonal measurements, or expert judgement.',
        'The platform keeps a deliberate boundary: it organizes research information and public resources, but it does not provide clinical diagnosis or turn a database link into biological causality or definitive identification.',
      ]),
    }),
    development: Object.freeze({
      eyebrow: 'A reviewable reference chemical space',
      title: 'Scientific Data Support',
      paragraphs: Object.freeze([
        'The mass distribution is derived from ChEBI Release 253. We selected 3-star entities with a human metabolite role—or a descendant role—and an available monoisotopic mass, producing 2,932 high-confidence records. The histogram and box summary use the 2,912 records at or below 1,500 Da.',
        'This is a distribution of ChEBI reference chemical entities relevant to human-metabolite annotation. It is not abundance, detection frequency, or a disease comparison. Twenty records above 1,500 Da are excluded only to preserve a readable scale; all 2,932 remain in the classification chart.',
        'Scientific data support also depends on sample metadata, quality control, peak processing and alignment parameters, ion mode, collision energy, library version, and confidence reporting. Keeping these with structures, masses, and spectra makes results easier to interpret, reproduce, and reuse.',
      ]),
    }),
    guides: Object.freeze({
      eyebrow: 'Identifiers, evidence, context, and standards',
      title: 'Knowledge Ecosystem & Citation',
      introduction: 'Human metabolite knowledge does not live in one database. Humeta focuses on how resources connect through stable identifiers, experimental spectra, and biological context.',
      entries: Object.freeze([
        Object.freeze({
          number: '01',
          label: 'Align the chemical entity',
          description: 'Names carry synonym and stereochemistry ambiguity; retain database IDs, InChIKey, SMILES, formula, and mass where possible.',
        }),
        Object.freeze({
          number: '02',
          label: 'Organize experimental evidence',
          description: 'Record ion mode, adduct, instrument, and collision conditions, and distinguish mass candidates, library matches, and standard confirmation.',
        }),
        Object.freeze({
          number: '03',
          label: 'Restore human context',
          description: 'Interpret entities within serum, plasma, urine, and other biospecimens, then connect them to pathways, disease, and study design.',
        }),
      ]),
      boundaryTitle: 'Usage boundary',
      boundary: 'This Humeta page supports research information architecture and front-end validation. Public database records and visualizations support exploration and candidate interpretation; they are not formal metabolite identification, diagnosis, treatment advice, or clinical decisions.',
      citationTitle: 'Citation principle',
      citation: 'Cite the original database, release, and related publication. The ChEBI charts identify Release 253 and their processing rules; HMDB metrics identify the official statistics page and access date. Humeta does not replace formal citations to source resources.',
      sourcesTitle: 'Data sources and method',
      sourcesIntroduction: 'The following links directly support the figures, charts, and scientific framing on this page. All were verified on 2026-08-05.',
      sourcesVerifiedLabel: 'Last verified',
      sourcesMethodSummary: 'HMDB metrics come from its official Statistics page; classification and mass distribution are derived from the ChEBI Release 253 flat files using the documented rules.',
      sourcesOwnership: 'Humeta does not own HMDB, ChEBI, MSI, or other external database content; cite the original resource, release, and relevant publication.',
      viewSourcesLabel: 'View all data sources',
      hideSourcesLabel: 'Hide detailed data sources',
      sourceLinkLabel: 'Open source',
      contactTitle: 'Contact',
      prefooterLabel: 'Usage boundary, citation principle, and contact information',
      contact: Object.freeze({
        positioning: 'Mass spectrometry multiomics technology services and clinical translation',
        addressLines: Object.freeze(['Life Science Industrial Park, No. 57 Xinda Street,', 'Dalian High-tech Industrial Zone, China']),
        note: 'Production data, service capability, and the formal Humeta citation format remain subject to company confirmation.',
      }),
    }),
  }),
})
