export const testingServiceNotice = '当前页面用于科研服务展示和需求沟通演示。具体检测范围、样本要求、技术参数、项目周期、交付内容及服务价格，以公司正式项目方案和业务确认结果为准。'

const draftState = Object.freeze({
  contentStatus: 'draft',
  verificationNote: '行业通用描述，待公司业务确认',
})

export const testingServiceCategories = Object.freeze([
  {
    id: 'research',
    label: '科研服务产品',
    shortLabel: '检测与分析服务',
    description: '面向代谢组学研究，从研究问题出发选择适合的检测与数据分析方向。',
    cta: '提交检测需求',
    services: [
      {
        id: '4a1800',
        title: '4a1800定量代谢组学',
        summary: '面向代谢物定量研究需求，提供从研究设计、样本检测到数据整理和统计分析的一体化服务，适用于生物标志物研究、机制研究及多组学联合分析。',
        scenarios: ['需要围绕明确科研问题开展代谢物定量研究', '希望比较不同分组的代谢变化', '计划将代谢数据与其他组学数据联合分析'],
        tags: ['生物标志物探索', '机制研究', '差异分析', '多组学联合分析'],
        information: ['研究目标与关注的代谢方向', '样本类型、分组与对照设计', '预期统计分析及联合分析需求'],
        notes: ['“4a1800”为服务名称，不代表对固定检测物数量作出承诺。', '实际检测范围和定量方案需根据项目目标确认。'],
        ...draftState,
      },
      {
        id: 'untargeted',
        title: '非靶向代谢组学',
        summary: '基于高分辨质谱检测思路，对生物样本中的代谢特征进行广覆盖分析，可用于探索组间代谢差异、候选生物标志物及相关代谢通路。',
        scenarios: ['探索组间整体代谢差异', '筛选候选代谢特征或生物标志物', '为后续靶向验证形成研究线索'],
        tags: ['生物标志物探索', '差异分析', '通路研究', '机制研究'],
        information: ['研究问题与实验分组', '样本基质和采集处理方式', '候选特征筛选与功能分析目标'],
        notes: ['代谢物注释和候选物确认范围需按项目方案约定。'],
        ...draftState,
      },
      {
        id: 'targeted',
        title: '靶向代谢组学',
        summary: '围绕预先确定的代谢物、代谢通路或化合物类别开展针对性检测，适用于候选标志物验证、重点代谢通路研究及定量分析需求。',
        scenarios: ['验证候选代谢标志物', '关注特定代谢通路或化合物类别', '开展方法验证或定量分析研究'],
        tags: ['方法验证', '通路研究', '机制研究', '生物标志物探索'],
        information: ['目标代谢物或化合物类别', '研究用途与预期定量方式', '样本基质、分组和对照信息'],
        notes: ['目标物覆盖范围、标准品和定量方式需在方案沟通阶段确认。'],
        ...draftState,
      },
      {
        id: 'lipidomics',
        title: '脂质组学',
        summary: '针对样本中的脂质分子进行系统检测和分类分析，用于研究不同脂质类别的变化及其与生理、病理过程之间的关系。',
        scenarios: ['比较不同分组的脂质谱变化', '研究脂质类别与生理病理过程的关系', '形成候选脂质标志物研究线索'],
        tags: ['差异分析', '机制研究', '生物标志物探索', '通路研究'],
        information: ['关注的脂质类别或研究方向', '样本基质及采集处理流程', '分组设计与统计分析目标'],
        notes: ['脂质覆盖范围、注释层级和定量方式需按项目确认。'],
        ...draftState,
      },
      {
        id: 'metabolic-flux',
        title: '代谢流',
        summary: '利用稳定同位素标记底物追踪代谢物的转化与分布，用于研究碳、氮等元素在代谢网络中的流向和动态变化。',
        scenarios: ['追踪特定底物在代谢网络中的去向', '比较不同条件下的代谢动态', '验证与关键代谢通路相关的机制假设'],
        tags: ['机制研究', '通路研究', '方法验证'],
        information: ['示踪目标与拟选底物', '培养或实验条件', '采样时间点、对照与终止代谢方案'],
        notes: ['代谢流实验对培养条件、示踪底物、采样时间点和对照设计要求较高，建议在送样前进行项目方案沟通。'],
        ...draftState,
      },
      {
        id: 'nta-screening',
        title: 'NTA筛查',
        summary: '面向复杂样本的筛查与特征发现需求，通过高分辨质谱及数据分析流程开展广泛信号检测、候选物筛查和结果分级整理。',
        scenarios: ['复杂样本中的信号筛查', '围绕研究目标整理候选特征', '为后续确认研究形成优先级线索'],
        tags: ['差异分析', '生物标志物探索', '方法验证'],
        information: ['筛查目标与候选物范围', '样本来源、基质和对照信息', '候选物确认与结果分级预期'],
        notes: ['具体筛查范围、候选物确认方式、结果分级和交付内容需根据项目目标确认。'],
        ...draftState,
      },
    ],
  },
  {
    id: 'solution',
    label: '行业解决方案',
    shortLabel: '场景化研究方案',
    description: '围绕行业研究场景组织代谢组学与多组学技术思路，形成可进一步讨论的项目框架。',
    cta: '咨询解决方案',
    services: [
      {
        id: 'tea-research',
        title: '茶学研究',
        summary: '围绕茶叶品质、加工过程、产地差异及功能成分研究需求，组合使用代谢组学及相关数据分析方法，为科研项目提供技术方案参考。',
        scenarios: ['茶叶品质与产地差异研究', '加工过程中的代谢变化研究', '功能成分及相关机制探索'],
        tags: ['差异分析', '通路研究', '多组学联合分析'],
        information: ['研究对象、品类与产地信息', '加工或处理环节及对照设计', '品质、成分或功能研究目标'],
        notes: ['具体技术组合与分析内容需根据研究对象和目标确认。'],
        ...draftState,
      },
      {
        id: 'traditional-medicine',
        title: '中医药研究',
        summary: '面向中药材、复方及相关研究场景，提供代谢组学和多组学分析思路，具体研究对象、检测范围和分析方案需按项目确认。',
        scenarios: ['中药材或复方相关研究', '成分差异与质量研究', '作用机制和多组学联合探索'],
        tags: ['差异分析', '机制研究', '多组学联合分析', '通路研究'],
        information: ['研究对象与样本基质', '研究阶段、分组与对照', '已有研究基础及拟解决问题'],
        notes: ['研究对象、检测范围和分析方案需按具体项目确认。'],
        ...draftState,
      },
      {
        id: 'multi-omics',
        title: '多组学联合分析',
        summary: '结合代谢组学与其他组学数据，通过相关性、通路和网络分析探索不同分子层级之间的关系。',
        scenarios: ['已有不同组学数据需要联合解读', '探索跨分子层级的相关关系', '围绕通路或网络形成整合分析思路'],
        tags: ['多组学联合分析', '通路研究', '机制研究'],
        information: ['已有数据类型与数据状态', '样本对应关系和分组信息', '联合分析目标及关注的生物学问题'],
        notes: ['可联合的数据类型、分析深度和交付形式需完成数据评估后确认。'],
        ...draftState,
      },
      {
        id: 'drug-discovery',
        title: '新药研发',
        summary: '面向药物研发不同阶段的科研需求，提供代谢表型、作用机制、候选标志物和安全性研究方向的技术咨询与项目方案支持。',
        scenarios: ['药物作用相关代谢表型研究', '候选机制或标志物探索', '研发阶段的代谢组学研究方案咨询'],
        tags: ['机制研究', '生物标志物探索', '通路研究', '多组学联合分析'],
        information: ['研发阶段与研究对象', '给药、分组和对照设计信息', '拟研究的机制、标志物或安全性方向'],
        notes: ['本服务不能替代药效、安全性或法规评价，具体研究边界需在项目方案中确认。'],
        ...draftState,
      },
    ],
  },
  {
    id: 'clinical',
    label: '临床转化',
    shortLabel: '研究转化合作',
    description: '提供临床研究与成果转化方向的前期需求收集入口，不构成诊断、注册或产品转化承诺。',
    cta: '提交合作需求',
    services: [
      {
        id: 'pipeline',
        title: '研发管线',
        summary: '面向代谢组学相关成果的研究转化和项目规划需求，提供前期需求梳理与合作咨询入口。',
        scenarios: ['研究成果的转化方向梳理', '早期项目规划与合作模式沟通', '已有研究基础的进一步评估'],
        tags: ['项目规划', '成果转化咨询', '合作需求梳理'],
        information: ['项目当前阶段', '已有研究基础和数据状态', '预期转化方向与合作需求'],
        notes: ['研发阶段、技术路径、适用范围和合规责任需由专业团队正式评估。'],
        ...draftState,
      },
      {
        id: 'iit',
        title: 'IIT合作',
        summary: '面向研究者发起的临床研究合作需求，提供项目沟通入口。具体研究设计、伦理、样本、数据和合作方式需单独确认。',
        scenarios: ['研究者发起的临床研究合作沟通', '临床样本与代谢组学研究设计讨论', '既有研究方案的技术可行性咨询'],
        tags: ['临床研究沟通', '研究方案咨询', '合作需求梳理'],
        information: ['研究问题与研究阶段', '伦理及合作单位基本情况', '样本、数据与预期合作方式'],
        notes: ['具体研究设计、伦理、样本、数据和合作方式需单独确认。'],
        ...draftState,
      },
      {
        id: 'ivd',
        title: 'IVD试剂盒研发',
        summary: '面向体外诊断相关研发需求提供合作咨询入口。具体开发阶段、性能要求、注册路径及合规责任需由专业团队确认。',
        scenarios: ['体外诊断相关研发的早期咨询', '已有候选标志物的转化需求沟通', '开发阶段与合作边界梳理'],
        tags: ['研发合作咨询', '项目阶段评估', '合规需求梳理'],
        information: ['当前开发阶段与研究基础', '预期应用场景和性能需求来源', '合作单位类型与预期合作方式'],
        notes: ['页面内容不表示已获得注册许可、已通过临床验证或保证注册成功，实际路径和责任需正式评估。'],
        ...draftState,
      },
      {
        id: 'ldt',
        title: 'LDT项目开发',
        summary: '面向实验室自建检测项目的研发合作需求，提供项目信息收集与前期沟通入口。实际适用范围和合规要求以正式评估为准。',
        scenarios: ['实验室自建检测项目的研发沟通', '已有方法或标志物基础的合作咨询', '适用范围与开发需求的前期梳理'],
        tags: ['研发合作咨询', '项目阶段评估', '合规需求梳理'],
        information: ['项目当前阶段与已有基础', '预期使用场景及合作单位情况', '拟议合作方式与待解决问题'],
        notes: ['实际适用范围、开发路径和合规要求以正式评估为准，不构成可直接用于临床诊断的承诺。'],
        ...draftState,
      },
    ],
  },
])

// Research-goal guidance is a deterministic presentation mapping over the
// existing service catalogue. It does not extend the public query protocol or
// create new service definitions.
export const researchGoalOptions = Object.freeze([
  Object.freeze({
    id: 'discover',
    number: '01',
    title: '发现代谢变化',
    description: '探索组间代谢差异、候选标志物或受影响的代谢通路。',
    primary: Object.freeze([{ categoryId: 'research', serviceId: 'untargeted' }]),
    supplemental: Object.freeze([
      { categoryId: 'research', serviceId: 'lipidomics' },
      { categoryId: 'research', serviceId: 'nta-screening' },
      { categoryId: 'research', serviceId: 'targeted' },
    ]),
    confirmation: '样本类型、实验组与对照组、样本量、采集时间、保存方式和质量控制设计。',
  }),
  Object.freeze({
    id: 'quantify',
    number: '02',
    title: '定量已知代谢物',
    description: '针对已有候选代谢物进行定量、比较或验证。',
    primary: Object.freeze([{ categoryId: 'research', serviceId: 'targeted' }]),
    supplemental: Object.freeze([{ categoryId: 'research', serviceId: '4a1800' }]),
    confirmation: '目标代谢物、样本基质、分组与对照、预期定量方式及标准品条件。',
  }),
  Object.freeze({
    id: 'mechanism',
    number: '03',
    title: '研究代谢机制',
    description: '研究底物、产物和代谢路径变化，或开展示踪和机制分析。',
    primary: Object.freeze([{ categoryId: 'research', serviceId: 'metabolic-flux' }]),
    supplemental: Object.freeze([
      { categoryId: 'research', serviceId: 'targeted' },
      { categoryId: 'solution', serviceId: 'multi-omics' },
    ]),
    confirmation: '机制假设、示踪目标、底物与实验条件、采样时间点、对照及终止代谢方案。',
  }),
  Object.freeze({
    id: 'unsure',
    number: '04',
    title: '暂不确定技术路线',
    description: '已有科学问题，但尚未确定平台、样本量、样本类型或检测方案。',
    primary: Object.freeze([]),
    supplemental: Object.freeze([]),
    consultationEntry: Object.freeze({ categoryId: 'research', serviceId: '4a1800' }),
    confirmation: '核心科学问题、研究阶段、现有样本和数据条件，以及希望优先解决的问题。',
  }),
])

export const sampleGuidance = Object.freeze([
  { id: 'serum-plasma', name: '血清/血浆', guidance: '建议低温保存，避免明显溶血及反复冻融，具体送样量和分装要求待项目确认。' },
  { id: 'biofluids', name: '尿液及其他体液', guidance: '建议分装并低温保存，采样时间及处理方式应在组内保持一致。' },
  { id: 'tissue', name: '组织', guidance: '建议采集后尽快冻存，取样位置、质量和处理方式应保持一致。' },
  { id: 'cells', name: '细胞/微生物', guidance: '建议按统一培养和收集条件处理，并在采集后尽快终止代谢活动和冻存。' },
  { id: 'feces', name: '粪便/肠道内容物', guidance: '建议均质化取样并低温保存，避免长时间室温放置。' },
  { id: 'special', name: '植物及特殊样本', guidance: '需结合样本基质、研究目标和前处理难度进行单独评估。' },
])

export const sampleGuidanceNotice = '具体样本量、生物学重复、保存条件、运输方式和接收标准，以正式项目方案为准。'

export const deliverables = Object.freeze([
  { id: 'qc', title: '项目样本与质控摘要', description: '整理项目样本、分组和约定范围内的质量控制信息。' },
  { id: 'data', title: '代谢物或代谢特征数据表', description: '按服务方案交付对应的数据结果和必要字段说明。' },
  { id: 'annotation', title: '代谢物注释与分类信息', description: '提供约定范围内的注释、分类及结果说明。' },
  { id: 'statistics', title: '多变量及差异统计图表', description: '根据确认的统计方案整理相应分析图表。' },
  { id: 'pathway', title: '通路与功能分析结果', description: '在适用且已约定的情况下提供通路或功能分析结果。' },
  { id: 'report', title: '项目结题报告', description: '汇总项目方案、主要结果和约定范围内的结果说明。' },
])

export const deliverablesNotice = '不同服务的交付物存在差异，实际内容以双方确认的项目方案为准。'

export const testingServiceFaqs = Object.freeze([
  { id: 'choose', question: '我不确定应该选择哪项服务怎么办？', answer: '可以先选择最接近研究目标的业务方向，并在需求说明中描述研究问题。当前页面为前端展示演示，具体服务选择、技术方案及临床转化边界仍需正式沟通；临床转化内容不代表临床诊断承诺。' },
  { id: 'sample-standard', question: '页面中的样本要求是否是正式标准？', answer: '不是。页面只展示通用的样本准备提示，具体样本量、生物学重复、保存、运输和接收标准需以公司正式项目方案为准。' },
  { id: 'send', question: '当前表单会把信息发送给公司吗？', answer: '不会。当前表单仅用于前端交互演示，内容只存在于当前页面内存中，不会发送、上传或保存。关闭或刷新页面后，已填写内容不会恢复。' },
  { id: 'timeline', question: '项目周期和交付内容如何确定？', answer: '项目周期和交付内容会受到服务类型、样本情况、研究设计和分析需求影响，需要在需求梳理后由业务和技术团队正式确认。本页面不提供固定周期或交付承诺。' },
])

export const testingServiceContact = Object.freeze({
  brand: 'iPhenome',
  positioning: '质谱多组学科技服务与临床转化',
  englishPositioning: 'Multiomics technologies for precision medicine research',
  phone: '0411-822871171',
  email: 'marcom@imetabolomics.cn',
  addressLines: ['大连高新技术产业园区信达街57号', '生命科学产业园'],
  workflowNote: '具体项目联系人及提交方式待业务流程确认。',
})

export function findTestingCategory(categoryId) {
  return testingServiceCategories.find((category) => category.id === categoryId)
}

export function findTestingService(categoryId, serviceId) {
  return findTestingCategory(categoryId)?.services.find((service) => service.id === serviceId)
}
