import coverPlatform from '../assets/news/platform-overview.svg?no-inline'
import coverAtlas from '../assets/news/metabolome-atlas.svg?no-inline'
import coverBrowser from '../assets/news/browser-navigation.svg?no-inline'
import coverSpectrum from '../assets/news/spectrum-search.svg?no-inline'
import coverStructure from '../assets/news/structure-search.svg?no-inline'
import coverTesting from '../assets/news/testing-service.svg?no-inline'
import coverContext from '../assets/news/research-context.svg?no-inline'
import coverIdentifiers from '../assets/news/metabolite-identifiers.svg?no-inline'
import coverCitation from '../assets/news/data-citation.svg?no-inline'
import coverReports from '../assets/news/reporting-standards.svg?no-inline'
import coverEvidence from '../assets/news/spectral-evidence.svg?no-inline'
import coverWorkflow from '../assets/news/search-workflow.svg?no-inline'

const freezeArticle = (article) => Object.freeze({
  ...article,
  title: Object.freeze(article.title),
  summary: Object.freeze(article.summary),
  body: Object.freeze({
    zh: Object.freeze(article.body.zh),
    en: Object.freeze(article.body.en),
  }),
  coverAlt: Object.freeze(article.coverAlt),
})

export const newsArticles = Object.freeze([
  freezeArticle({
    slug: 'humeta-platform-overview', publishedAt: '2026-08-05T14:30:00+08:00', category: 'platform', author: 'Humeta 编辑部', coverKey: 'platform', cover: coverPlatform,
    title: { zh: 'Humeta：连接代谢物、结构与光谱证据的研究入口', en: 'Humeta: a research entry point for metabolites, structures, and spectral evidence' },
    summary: { zh: '认识 Humeta 当前已经提供的本地研究信息架构，以及各功能之间的连接方式。', en: 'An introduction to Humeta’s current local research information architecture and how its tools connect.' },
    body: {
      zh: ['Humeta 将代谢物浏览、谱图检索、结构检索与科研服务入口组织在同一站点中，帮助使用者从不同证据类型进入信息空间。', '平台页面用于科研信息组织和前端交互验证。检索结果仍需结合原始数据、实验条件、参考来源与专业判断进行解释。'],
      en: ['Humeta brings metabolite browsing, spectrum search, structure search, and research-service entry points into one site so users can approach information through different evidence types.', 'These pages support research information architecture and front-end validation. Search results still require interpretation alongside raw data, experimental conditions, reference provenance, and expert judgement.'],
    },
    coverAlt: { zh: '连接分子、光谱和知识节点的 Humeta 平台抽象图', en: 'Abstract Humeta platform graphic connecting molecule, spectrum, and knowledge nodes' },
  }),
  freezeArticle({
    slug: 'human-metabolome-atlas-primer', publishedAt: '2026-08-04T16:10:00+08:00', category: 'research', author: 'Humeta 科研内容组', coverKey: 'atlas', cover: coverAtlas,
    title: { zh: '人体代谢组图谱为什么需要多层证据', en: 'Why a human metabolome atlas needs multiple layers of evidence' },
    summary: { zh: '从化学实体、人体样本语境与实验谱图三个层面理解代谢组图谱。', en: 'A primer on metabolome atlases across chemical entities, human biospecimen context, and experimental spectra.' },
    body: {
      zh: ['人体代谢组不是静态分子清单。同一个代谢物需要结合生物样本、代谢通路、浓度范围和实验条件理解。', '图谱式组织能够并置实体标识、结构分类与光谱证据，但数据库关联本身不代表因果关系或确定鉴定。'],
      en: ['The human metabolome is not a static molecule list. Each metabolite gains meaning through biospecimen, pathway, concentration range, and experimental conditions.', 'An atlas can align identifiers, structural classification, and spectral evidence, but a database association alone does not establish causality or definitive identification.'],
    },
    coverAlt: { zh: '人体轮廓与代谢网络构成的图谱抽象图', en: 'Abstract atlas graphic combining a human silhouette and metabolic network' },
  }),
  freezeArticle({
    slug: 'browser-navigation-guide', publishedAt: '2026-08-04T10:20:00+08:00', category: 'platform', author: 'Humeta 产品组', coverKey: 'browser', cover: coverBrowser,
    title: { zh: '使用 Browser 浏览代谢物信息卡片', en: 'Browsing metabolite information cards with Browser' },
    summary: { zh: '了解 Browser 列表、分页与详情入口的基本阅读顺序。', en: 'Learn the basic reading order for Browser lists, pagination, and detail entry points.' },
    body: {
      zh: ['Browser 将本地演示数据整理为可分页的结果卡片，便于从名称、分子式和关键标识进入详情。', '阅读时应区分展示字段与实验结论，并回到详情中的来源说明核对语境。'],
      en: ['Browser organizes local demonstration data into paginated result cards, making it easier to move from names, formulas, and identifiers into details.', 'Readers should distinguish display fields from experimental conclusions and check contextual source notes in the detail view.'],
    },
    coverAlt: { zh: '带筛选路径和代谢物卡片的浏览器界面抽象图', en: 'Abstract browser interface with a filter path and metabolite cards' },
  }),
  freezeArticle({
    slug: 'spectrum-search-basics', publishedAt: '2026-08-03T15:40:00+08:00', category: 'research', author: 'Humeta 科研内容组', coverKey: 'spectrum', cover: coverSpectrum,
    title: { zh: '质谱检索入门：从峰表到候选结果', en: 'Spectrum search basics: from peak lists to candidate results' },
    summary: { zh: '梳理本地 Spectrum Search 中峰表输入、参数确认和结果阅读的流程。', en: 'A walkthrough of peak-list input, parameter checks, and result reading in local Spectrum Search.' },
    body: {
      zh: ['谱图检索的输入需要明确离子模式、前体质量和峰表格式。参数不完整会直接影响候选空间与相似性解释。', 'Humeta 的 Spectrum Search 用于演示本地工作流；候选匹配不能替代同条件标准品或正交实验确认。'],
      en: ['Spectrum-search input should make ion mode, precursor mass, and peak-list format explicit. Missing parameters directly affect candidate space and similarity interpretation.', 'Humeta Spectrum Search demonstrates a local workflow; candidate matches do not replace authentic standards under matched conditions or orthogonal confirmation.'],
    },
    coverAlt: { zh: '蓝青色质谱峰图与候选节点', en: 'Blue-teal mass-spectrum peaks with candidate nodes' },
  }),
  freezeArticle({
    slug: 'structure-search-basics', publishedAt: '2026-08-03T11:25:00+08:00', category: 'research', author: 'Humeta 科研内容组', coverKey: 'structure', cover: coverStructure,
    title: { zh: '化学结构检索：绘制、导入与结果理解', en: 'Chemical structure search: drawing, importing, and interpreting results' },
    summary: { zh: '介绍 Structure Search 的结构输入方式与相似结果的谨慎解读。', en: 'An introduction to structure input and careful interpretation of similar results in Structure Search.' },
    body: {
      zh: ['结构检索可以从绘制或文本导入开始，连接关系、键型与立体化学都会影响查询表达。', '结构相似性描述的是表示空间中的接近程度，不自动等同于共同生物功能、相同来源或可互换结论。'],
      en: ['Structure search can begin with drawing or text import; connectivity, bond types, and stereochemistry all affect the query representation.', 'Structural similarity describes proximity in a representation space. It does not automatically imply shared biological function, origin, or interchangeable conclusions.'],
    },
    coverAlt: { zh: '六元环分子结构与相似性路径抽象图', en: 'Abstract six-membered molecular structure with similarity paths' },
  }),
  freezeArticle({
    slug: 'testing-service-workflow', publishedAt: '2026-08-02T17:00:00+08:00', category: 'platform', author: 'Humeta 服务组', coverKey: 'testing', cover: coverTesting,
    title: { zh: 'Testing Service：从需求选择到本地表单确认', en: 'Testing Service: from requirement selection to local form confirmation' },
    summary: { zh: '查看站内科研服务咨询流程及样本信息填写边界。', en: 'Review the on-site research-service inquiry flow and the boundaries of sample information entry.' },
    body: {
      zh: ['Testing Service 页面将服务类别、项目说明、样本指引与咨询表单串联成清晰流程。', '表单当前用于前端交互演示；提交前应避免填写敏感临床信息，并以正式沟通确认服务能力和样本要求。'],
      en: ['The Testing Service page connects service categories, project explanations, sample guidance, and the inquiry form into a clear flow.', 'The form currently demonstrates front-end interaction. Avoid entering sensitive clinical information and confirm capabilities and sample requirements through formal communication.'],
    },
    coverAlt: { zh: '样本管、步骤节点和确认标记组成的服务流程图', en: 'Service workflow graphic with sample tubes, steps, and a confirmation mark' },
  }),
  freezeArticle({
    slug: 'research-context-matters', publishedAt: '2026-08-02T09:35:00+08:00', category: 'research', author: 'Humeta 科研内容组', coverKey: 'context', cover: coverContext,
    title: { zh: '为什么质谱候选必须回到研究语境', en: 'Why spectral candidates must return to research context' },
    summary: { zh: '候选分子需要与样本类型、采集条件和研究设计共同解释。', en: 'Candidate molecules need interpretation alongside sample type, acquisition conditions, and study design.' },
    body: {
      zh: ['相似谱图或精确质量只能提供候选证据。样本来源、前处理、仪器条件与对照设计决定了证据能够支持多强的表述。', '将候选放回研究语境，有助于避免把数据库命中误写成生物学因果或临床判断。'],
      en: ['A similar spectrum or accurate mass supplies candidate evidence only. Sample origin, preparation, instrument conditions, and controls determine the strength of any claim.', 'Returning candidates to study context helps prevent database hits from being overstated as biological causality or clinical judgement.'],
    },
    coverAlt: { zh: '样本、仪器与研究文档之间的证据连接图', en: 'Evidence links among a sample, instrument, and research document' },
  }),
  freezeArticle({
    slug: 'metabolite-identifiers-primer', publishedAt: '2026-08-01T16:50:00+08:00', category: 'research', author: 'Humeta 科研内容组', coverKey: 'identifiers', cover: coverIdentifiers,
    title: { zh: '代谢物标识符：名称之外还应记录什么', en: 'Metabolite identifiers: what to record beyond a name' },
    summary: { zh: '用数据库 ID、InChIKey、SMILES、分子式和质量减少实体歧义。', en: 'Reduce entity ambiguity with database IDs, InChIKey, SMILES, formula, and mass.' },
    body: {
      zh: ['常用名称可能对应同义词、盐型或立体异构体，仅依赖名称容易造成跨资源错配。', '在数据交换和引用中同时保留稳定 ID、InChIKey、结构表达、分子式与质量，更有利于复核实体边界。'],
      en: ['Common names may hide synonyms, salt forms, or stereoisomers, making name-only alignment across resources unreliable.', 'Retaining stable IDs, InChIKey, structure representations, formula, and mass improves reviewability in data exchange and citation.'],
    },
    coverAlt: { zh: '多种代谢物标识符汇聚到一个分子实体', en: 'Multiple metabolite identifiers converging on one molecular entity' },
  }),
  freezeArticle({
    slug: 'data-citation-principles', publishedAt: '2026-08-01T13:15:00+08:00', category: 'research', author: 'Humeta 科研内容组', coverKey: 'citation', cover: coverCitation,
    title: { zh: '科研数据引用：记录来源、版本与访问日期', en: 'Scientific data citation: record source, release, and access date' },
    summary: { zh: '让数据库数字、分类和图表保持可追溯的基础做法。', en: 'Basic practices for keeping database figures, classifications, and charts traceable.' },
    body: {
      zh: ['引用数据库内容时，应记录原始资源、具体版本、处理规则与访问日期，避免只引用二次展示页面。', '派生统计还应说明筛选、缺失值与排除规则，使读者能够理解数字的适用边界。'],
      en: ['When citing database content, record the original resource, specific release, processing rules, and access date rather than only a secondary display page.', 'Derived statistics should also document filtering, missing data, and exclusion rules so readers can understand their scope.'],
    },
    coverAlt: { zh: '带版本标签和引用链的科研文档', en: 'Research document with a release label and citation chain' },
  }),
  freezeArticle({
    slug: 'metabolomics-reporting-standards', publishedAt: '2026-07-31T15:05:00+08:00', category: 'research', author: 'Humeta 科研内容组', coverKey: 'reports', cover: coverReports,
    title: { zh: '代谢组学报告应保留哪些关键条件', en: 'Key conditions to retain in metabolomics reporting' },
    summary: { zh: '从样本元数据到注释置信度，梳理可复核报告的核心信息。', en: 'Core information for reviewable reporting, from sample metadata to annotation confidence.' },
    body: {
      zh: ['可复核报告需要保留样本信息、质量控制、前处理、仪器参数、峰处理方法和统计设计。', '代谢物注释还应区分精确质量候选、谱库匹配和标准品确认，不应用单一“鉴定”标签掩盖证据层级。'],
      en: ['Reviewable reports retain sample metadata, quality control, preparation, instrument parameters, peak processing, and statistical design.', 'Metabolite annotation should distinguish accurate-mass candidates, library matches, and authentic-standard confirmation instead of hiding evidence levels behind one identification label.'],
    },
    coverAlt: { zh: '包含质控、参数和证据等级的报告清单', en: 'Reporting checklist containing quality control, parameters, and evidence levels' },
  }),
  freezeArticle({
    slug: 'reading-spectral-evidence', publishedAt: '2026-07-31T10:45:00+08:00', category: 'research', author: 'Humeta 科研内容组', coverKey: 'evidence', cover: coverEvidence,
    title: { zh: '阅读谱图证据：相似度不是唯一答案', en: 'Reading spectral evidence: similarity is not the only answer' },
    summary: { zh: '结合峰覆盖、质量偏差和实验条件理解谱图相似结果。', en: 'Interpret spectral similarity with peak coverage, mass error, and experimental conditions.' },
    body: {
      zh: ['相似度是结果排序线索之一，还需要观察关键碎片、峰覆盖、质量偏差与碰撞条件是否可比。', '当参考谱条件不一致或信息不完整时，结果应保持候选表述，并明确后续验证需求。'],
      en: ['Similarity is one ranking signal. Key fragments, peak coverage, mass error, and comparability of collision conditions also matter.', 'When reference conditions differ or metadata are incomplete, results should remain candidates and state the need for further validation.'],
    },
    coverAlt: { zh: '上下镜像的蓝青色谱峰与证据标尺', en: 'Mirrored blue-teal spectrum peaks with an evidence scale' },
  }),
  freezeArticle({
    slug: 'search-workflow-checklist', publishedAt: '2026-07-30T14:00:00+08:00', category: 'platform', author: 'Humeta 编辑部', coverKey: 'workflow', cover: coverWorkflow,
    title: { zh: '从浏览到检索：Humeta 本地工作流清单', en: 'From browsing to search: a local Humeta workflow checklist' },
    summary: { zh: '按问题类型选择 Browser、Spectrum Search 或 Structure Search。', en: 'Choose Browser, Spectrum Search, or Structure Search according to the research question.' },
    body: {
      zh: ['已知名称或标识符时可先浏览实体信息；持有谱峰时进入 Spectrum Search；关注骨架或子结构时使用 Structure Search。', '不同入口解决的问题不同。记录查询输入、参数与候选筛选过程，能够让后续讨论更清晰。'],
      en: ['Start with Browser for a known name or identifier, use Spectrum Search for peak data, and choose Structure Search for scaffold or substructure questions.', 'Each entry point answers a different question. Recording query input, parameters, and candidate filtering makes later discussion clearer.'],
    },
    coverAlt: { zh: '浏览、谱图与结构检索汇入结果卡片的流程图', en: 'Workflow from browsing, spectrum, and structure search into result cards' },
  }),
])

export const timelineMilestones = Object.freeze([
  Object.freeze({
    date: '2026-08-05', title: { zh: 'News 模块', en: 'News module' },
    items: {
      zh: Object.freeze(['新增双语微信博客列表、本地文章详情与升级记录页面。', '加入桌面与移动端 News 二级菜单、路由分页及原创本地 SVG 封面。']),
      en: Object.freeze(['Added bilingual WeChat Blog lists, local article details, and the Upgrade Record page.', 'Added desktop and mobile News submenus, route-based pagination, and original local SVG covers.']),
    },
  }),
  Object.freeze({
    date: '2026-08-05', title: { zh: 'About Humeta', en: 'About Humeta' },
    items: {
      zh: Object.freeze(['完成双语 About 页面、科研数据说明与知识生态内容。', '加入 HMDB 公开统计语境与基于 ChEBI Release 253 的可追溯图表。']),
      en: Object.freeze(['Completed the bilingual About page, scientific data notes, and knowledge-ecosystem content.', 'Added context for public HMDB statistics and traceable charts derived from ChEBI Release 253.']),
    },
  }),
  Object.freeze({
    date: '2026-08-04', title: { zh: 'Testing Service', en: 'Testing Service' },
    items: {
      zh: Object.freeze(['实现科研服务类别、项目详情、流程、样本指引与本地咨询表单交互。']),
      en: Object.freeze(['Implemented research-service categories, project details, process, sample guidance, and local inquiry-form interactions.']),
    },
  }),
  Object.freeze({
    date: '2026-08-04', title: { zh: 'Spectrum Search', en: 'Spectrum Search' },
    items: {
      zh: Object.freeze(['完成本地 MS1/MS2 输入、参数设置、谱图展示、结果卡片与分页工作流。']),
      en: Object.freeze(['Completed local MS1/MS2 input, parameter settings, spectrum displays, result cards, and pagination workflows.']),
    },
  }),
  Object.freeze({
    date: '2026-08-03', title: { zh: 'Structure Search', en: 'Structure Search' },
    items: {
      zh: Object.freeze(['集成本地结构编辑器，并实现结构导入、检索选项和结果展示流程。']),
      en: Object.freeze(['Integrated the local structure editor and implemented structure import, search options, and result presentation.']),
    },
  }),
  Object.freeze({
    date: '2026-08-02', title: { zh: 'Browser 模块', en: 'Browser module' },
    items: {
      zh: Object.freeze(['实现代谢物浏览结果卡片、分页、搜索状态与本地详情页面。']),
      en: Object.freeze(['Implemented metabolite browse cards, pagination, search states, and local detail pages.']),
    },
  }),
  Object.freeze({
    date: '2026-08-01', title: { zh: '网站基础页面', en: 'Website foundation' },
    items: {
      zh: Object.freeze(['建立 Vue 3 网站基础、共享 Header/Footer、首页与响应式视觉体系。']),
      en: Object.freeze(['Established the Vue 3 foundation, shared Header/Footer, homepage, and responsive visual system.']),
    },
  }),
])

export function findNewsArticle(slug) {
  return newsArticles.find((article) => article.slug === slug)
}
