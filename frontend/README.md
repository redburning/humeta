# Humeta Web

Humeta 人体代谢组图谱前端项目。

项目基于 Vue 3 和 Vite 开发，目前已完成首页、响应式导航、搜索区域、推荐卡片、占位路由和 Footer。

![Humeta 首页预览](./docs/home-preview.jpg)

## 技术栈

- Vue 3
- Vite
- Vue Router
- Composition API
- 原生 CSS
- CSS Grid / Flexbox
- SVG

## 已完成功能

- Humeta 首页
- 桌面端顶部导航栏
- 移动端汉堡菜单
- Hero 主视觉区域
- 关键词搜索输入
- 产品类型选择
- Enter 键触发搜索
- Reference 标签自动填充
- 推荐内容卡片
- 页面占位路由
- 响应式布局
- Footer 信息区域

## 导航结构

- Browser
- Spectrum search
- Structure search
- News
- About us
- 我要测

## 项目目录

```text
humeta-web/
├─ public/
│  └─ images/
├─ src/
│  ├─ assets/
│  │  └─ styles/
│  ├─ components/
│  │  ├─ home/
│  │  └─ layout/
│  ├─ router/
│  ├─ views/
│  ├─ App.vue
│  └─ main.js
├─ docs/
├─ reference/
├─ index.html
├─ package.json
└─ vite.config.js
```

## 本地开发

### 环境要求

- Node.js 18 或更高版本
- npm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认访问地址：

```text
http://127.0.0.1:5173/
```

### 生产构建

```bash
npm run build
```

### 本地预览生产构建

```bash
npm run preview
```

## 当前页面

| 路径 | 状态 |
|---|---|
| `/` | 已完成首页 |
| `/browser` | 占位页面 |
| `/spectrum-search` | 占位页面 |
| `/structure-search` | 占位页面 |
| `/news` | 占位页面 |
| `/about` | 占位页面 |
| `/testing` | 占位页面 |

## 主要组件

- `HeaderNav.vue`：顶部导航和移动端菜单
- `HeroSection.vue`：首页主视觉区域
- `SearchPanel.vue`：搜索输入和产品类型选择
- `ReferenceTags.vue`：快捷搜索标签
- `FeatureCard.vue`：推荐内容卡片
- `FooterSection.vue`：网站底部区域

## 素材说明

当前部分视觉素材为根据参考设计近似重建的 SVG 和 CSS 图形，包括：

- 人体与代谢通路背景
- 化学结构示意图
- 六边形装饰
- 光晕和网格
- Footer 圆弧装饰

后续获得正式品牌素材后，可替换对应 SVG 文件。

## 后续计划

- 首页视觉细节精修
- 接入真实搜索接口
- 开发 Browser 页面
- 开发 Spectrum search 页面
- 开发 Structure search 页面
- 开发 News 页面
- 开发 About us 页面
- 开发“我要测”页面

## 仓库

https://github.com/syx147-c/humeta-web
