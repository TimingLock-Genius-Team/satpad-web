# SATPAD 前端实施方案

> 整合自 `SATPAD逐步实现计划.md` 与 `SATPAD前端实施计划.md`，涵盖从架构设计到上线打磨的完整前端落地指南。

---

## 1. 文档定位

- **用途**：SATPAD Web 前端从 0 到 1 的完整实施文档，包含架构设计、模块说明、阶段推进、验收标准。
- **适用范围**：MVP + Phase 2 打磨内容。
- **配套文档**：
  - `SATPAD前端模块方案.md`：产品级与页面级设计源头。
- **执行原则**：
  - 先搭基础层，再搭服务层，再做页面层。
  - 所有 UI 文案从第一天开始即 i18n-ready。
  - 优先保证 Explore、Token Detail、Create 三条主路径闭环，再补 Portfolio 与打磨项。

---

## 2. 实施总目标

### 2.1 业务目标

- 完成 SATPAD 在 XLayer 上的前端落地。
- 支持浏览代币、查看详情、买卖、创建代币、查看个人资产。
- 保证与 sat1 Bonding Curve 相关的价格、进度、手续费与毕业状态展示一致。

### 2.2 技术目标

- 使用 `Next.js 14 + App Router + TypeScript` 搭建项目。
- 使用 `viem + wagmi v2 + RainbowKit` 完成链交互与钱包连接。
- 使用 `zustand` 管理跨页面状态。
- 使用 `next-intl` 建立英文文案中心，具备后续多语言扩展能力。
- 使用 `lightweight-charts` 支撑价格图表。

### 2.3 页面范围

- `/` Explore Page
- `/token/[address]` Token Detail Page
- `/create` Create Token Page
- `/portfolio` Portfolio Page

### 2.4 非功能范围

- 深色主题设计 Token
- 响应式适配（sm / md / lg / xl / 2xl）
- 错误处理与降级策略
- 动画与微交互
- SEO 与 metadata

---

## 3. 总体架构

### 3.1 分层架构

```text
UI Layer
├── app/ 页面入口
├── components/ 页面组件与共享组件
└── hooks/ 页面逻辑与状态拼装

State Layer
├── useWalletStore
├── useExploreStore
└── useTokenStore

Service Layer
├── curve.ts       · 曲线纯数学计算
├── public-client.ts · 链上只读访问
├── contracts.ts   · ABI 管理与写操作
├── subgraph.ts    · 聚合数据查询
└── events.ts      · 链上事件订阅

Config / Type / Util Layer
├── config/   · 常量、链信息、合约地址
├── types/    · 类型定义
└── utils/    · 格式化、校验、工具函数
```

### 3.2 分层原则

- **配置层**：放常量、链信息、地址、公共格式化与校验规则。
- **服务层**：只处理链上读取、链上写入、Subgraph 请求、曲线计算。
- **状态层**：聚合页面共享状态，不直接渲染 UI。
- **Hook 层**：面向页面与组件暴露易消费的数据与操作。
- **UI 层**：只负责展示、触发交互、消费 hooks/store。

### 3.3 关键边界

- UI 不直接写公式。
- 页面不直接拼合 ABI 与 RPC 请求。
- hooks 不定义视觉规则。
- store 不直接持有复杂 JSX 或视图状态碎片。

### 3.4 目录结构

```text
src/
├── app/                    · 页面入口、路由、loading/error/metadata
├── components/
│   ├── layout/             · Header、Footer、MobileNav
│   ├── explore/            · ExploreTabs、TokenCard、TokenGrid
│   ├── token-detail/       · TokenHeader、TradePanel、PriceChart 等
│   ├── create/             · CreateStepper、各 Step 表单
│   ├── portfolio/          · PortfolioSummary、HoldingsList
│   └── shared/             · 跨页面通用组件
├── hooks/                  · 页面逻辑与数据拼装
├── lib/
│   ├── i18n.ts
│   └── locales/en.json
├── services/               · 曲线、链上、Subgraph、事件
├── stores/                 · zustand 页面共享状态
├── config/                 · chain、contracts、curve、constants
├── types/                  · token、curve、trade、api
└── utils/                  · cn、format、address、validate、image
```

---

## 4. 配置、类型与工具层

### 4.1 配置文件

| 文件 | 职责 |
|------|------|
| `src/config/chain.ts` | XLayer Chain 定义、RPC、浏览器链接 |
| `src/config/contracts.ts` | Deployer / Hook / 相关合约地址 |
| `src/config/curve.ts` | `K`、`S`、`FEE_RATE`、Graduation 阈值 |
| `src/config/constants.ts` | 轮询间隔、分页大小、最大买入限制、去抖时间 |

**关键常量**

- `K = 21_000_000`
- `S = 100`
- `FEE_RATE = 0.003`
- `MAX_BUY_OKB = 10`

### 4.2 类型文件

| 文件 | 职责 |
|------|------|
| `src/types/token.ts` | Token 列表项、详情项、metadata |
| `src/types/curve.ts` | 曲线参数、进度、价格点 |
| `src/types/trade.ts` | 交易 quote、订单、历史 |
| `src/types/api.ts` | Subgraph 查询参数与返回 |

**设计目标**：页面模型与服务模型解耦；明确区分 Token 列表项、详情项、交易项、图表点、查询参数；所有接口优先靠类型约束。

### 4.3 工具函数

| 文件 | 职责 |
|------|------|
| `src/utils/cn.ts` | clsx + tailwind-merge 样式合并 |
| `src/utils/format.ts` | 数字、日期、地址格式化 |
| `src/utils/address.ts` | 地址截断、校验、EIP-55 |
| `src/utils/validate.ts` | 表单校验规则 |
| `src/utils/image.ts` | 图片压缩与上传前预处理 |

---

## 5. 服务层模块

### 5.1 `curve.ts` — 曲线计算

**职责**：提供 sat1 Bonding Curve 所有纯数学能力。

| 函数 | 输入 | 输出 |
|------|------|------|
| `marginalPrice(okbCum)` | OKB 累计投入 | 边际价格 |
| `totalMinted(okbCum)` | OKB 累计投入 | 累计铸造量 |
| `quoteMint(okbAmount, currentOkbCum)` | 买入金额、当前累计 | 预估获得 token 数 |
| `quoteBurn(tokenAmount, currentOkbCum)` | 卖出数量、当前累计 | 预估获得 OKB 数 |
| `priceImpact(amount, currentOkbCum)` | 交易量、当前累计 | 价格冲击百分比 |
| `isGraduated(okbCum)` | OKB 累计投入 | 是否毕业 |
| `generateCurvePoints(steps)` | 采样步数 | 曲线坐标点数组 |

**验收**：纯函数、无副作用、可单测；与模块方案参考值一致。

### 5.2 `public-client.ts` — 链上只读

| 方法 | 作用 |
|------|------|
| `readOkbCum(tokenAddress)` | 读取累计 OKB 投入 |
| `readBalanceOf(tokenAddress, userAddress)` | 读取代币余额 |
| `readTokenMetadata(tokenAddress)` | 读取 metadata |
| `readSelfDeprecated(tokenAddress)` | 读取自弃用状态 |
| `isValidToken(tokenAddress)` | 校验 SATPAD token 合法性 |

**要求**：可被 hooks 或服务组合复用；网络异常时具备标准错误抛出格式。

### 5.3 `contracts.ts` — 合约交互

**职责**：管理 ABI、合约地址、读写调用入口。

| 方法 | 作用 |
|------|------|
| `mint()` | 买入代币 |
| `burn()` | 卖出代币 |
| `deploy()` | 部署新代币 |

**要求**：不在页面组件中直接书写 ABI 片段；合约地址和 ABI 引用方式保持统一。

### 5.4 `subgraph.ts` — 聚合数据

| 方法 | 作用 |
|------|------|
| `queryTokenList(params)` | 代币列表（支持 tab 筛选与分页） |
| `queryTokenDetail(address)` | 代币详情 |
| `queryTradeHistory(address, pagination)` | 交易历史 |
| `queryUserTokens(userAddress)` | 用户持仓 |
| `queryUserTradeHistory(userAddress)` | 用户交易历史 |
| `searchTokens(keyword)` | 按名称/地址搜索 |
| `queryChartData(address, range)` | 图表聚合数据 |

**设计要求**：在 Subgraph 不稳定时，允许 empty/mock/fallback；页面依赖接口，不依赖具体实现源。

### 5.5 `events.ts` — 实时事件

| 方法 | 作用 |
|------|------|
| `subscribeMintEvents()` | 监听 Mint 事件 |
| `subscribeBurnEvents()` | 监听 Burn 事件 |
| `subscribeDeployEvents()` | 监听 Deploy 事件 |

**验收**：返回取消订阅函数；能与历史列表、详情页状态刷新协同。

---

## 6. 状态层模块

### 6.1 `useWalletStore`

| 字段 | 说明 |
|------|------|
| `address` | 当前钱包地址 |
| `chainId` | 当前网络 ID |
| `isConnected` | 连接状态 |

**边界**：钱包底层状态仍以 wagmi 为准，store 只做页面消费映射与补充。

### 6.2 `useExploreStore`

| 字段 | 说明 |
|------|------|
| `activeTab` | 当前 tab（new / trending / graduating） |
| `searchKeyword` | 搜索关键字 |
| `tokens` | 列表数据 |
| `loading / error` | 加载与错误状态 |

**用途**：让 ExploreTabs、SearchBar、TokenGrid 共享统一数据上下文。

### 6.3 `useTokenStore`

| 字段 | 说明 |
|------|------|
| `tokenInfo` | 当前 token 基础信息 |
| `okbCum / totalMinted / graduated` | 曲线与进度状态 |
| `txHistory` | 当前交易历史 |
| `chartData` | 当前图表数据 |
| `tradePanelState` | Buy/Sell 面板局部状态 |

**用途**：让详情页各区域同步刷新而不层层透传 props。

---

## 7. Hook 层模块

### 7.1 数据类 Hooks

| Hook | 职责 |
|------|------|
| `useTokenList` | 拉取首页列表与聚合字段 |
| `useTokenDetail` | 整合 metadata、链上数据、subgraph 数据 |
| `useTransactionHistory` | 历史记录 + 实时事件合流 |
| `usePortfolio` | 用户持仓、总资产、盈亏计算 |

### 7.2 交易类 Hooks

| Hook | 职责 |
|------|------|
| `useBondingCurve` | 提供曲线进度、边际价格、minted 数值 |
| `useTradeQuote` | 根据输入实时给出 quote 与 Price Impact |
| `useTokenEvents` | 监听指定 token 的链上事件 |
| `useCreateToken` | 组织 metadata、IPFS、部署、跳转闭环 |

### 7.3 工具类 Hooks

| Hook | 职责 |
|------|------|
| `useDebounce` | 输入去抖（300ms） |

**统一要求**：hook 对外返回稳定对象结构；把轮询、订阅、状态合并留在 hook，不扩散到组件层。

---

## 8. 共享组件

### 8.1 交互与展示类

| 组件 | 作用 | 使用位置 |
|------|------|----------|
| `CopyAddress` | 复制地址到剪贴板 | 详情页、交易记录 |
| `AddressDisplay` | 截断展示地址 | 卡片、列表、详情 |
| `TokenAvatar` | 头像与 fallback | 卡片、详情、持仓 |
| `VerifiedContractLink` | 区块浏览器验证链接 | Footer、详情页 |
| `SearchBar` | 全局搜索入口 | Header（桌面）、列表上方（移动端） |

### 8.2 状态反馈类

| 组件 | 作用 | 使用位置 |
|------|------|----------|
| `Skeleton` | 加载占位 | 全局 |
| `EmptyState` | 空状态展示 | Explore、Portfolio、Invalid Token |
| `ErrorBoundary` | 捕获渲染错误 | 页面级区域 |
| `WelcomeModal` | 首访引导 | 首次进入站点 |

### 8.3 交易说明类

| 组件 | 作用 | 使用位置 |
|------|------|----------|
| `PriceImpactBadge` | 高价格冲击提示 | Buy/Sell 表单 |
| `FeeTooltip` | 解释手续费去向 | Buy/Sell 表单 |
| `CurveExplainCollapse` | 解释曲线机制 | Detail / Create |
| `CountdownTimer` | 倒计时 | 活动或限时场景 |

**统一验收**：每个组件至少覆盖正常态、空态或错误态；同一组件在不同页面保持一致语义与样式。

---

## 9. 阶段一：项目初始化与基础设施 — M1

### 步骤 1：初始化 Next.js 项目

**目标**：得到可运行的空白项目骨架。

**关键任务**

- 创建 `Next.js 14 App Router + TypeScript + Tailwind + ESLint` 项目。
- 配置 `src/` 目录与 `@/` 路径别名。
- 安装核心依赖：
  - 链交互：`viem`、`wagmi`、`@rainbow-me/rainbowkit`、`@tanstack/react-query`
  - 状态：`zustand`
  - 表单：`react-hook-form`、`zod`、`@hookform/resolvers`
  - UI 工具：`clsx`、`tailwind-merge`、`lucide-react`、`sonner`
  - 图表：`lightweight-charts`
  - i18n：`next-intl`
  - 图片：`browser-image-compression`
  - 日期：`date-fns`

**交付物**：`package.json`、`tsconfig.json`、`next.config.js`、`src/app/layout.tsx`

**验收**：`npm run dev` 成功启动；项目首屏无报错、无构建阻塞。

---

### 步骤 2：配置设计系统 Token

**目标**：把视觉 Token 落到 Tailwind 与全局样式中。

**关键任务**

- 在 `tailwind.config.ts` 中落地颜色、圆角、间距、字体、最大宽度。
- 在 `src/app/globals.css` 中定义 CSS Variables。
- 创建 `src/utils/cn.ts`，统一 className 合并逻辑。
- 接入 `Inter` 与 `JetBrains Mono`。

**关键 Token**

| 类别 | Token |
|------|-------|
| 背景 | `surface-base`、`surface`、`surface-elevated`、`surface-highlight` |
| 文本 | `text-primary`、`text-secondary`、`text-tertiary` |
| 边框 | `border-default`、`border-hover` |
| 语义色 | `accent-primary`、`accent-success`、`accent-warning`、`accent-danger` |
| 圆角 | `radius-card`、`radius-input`、`radius-pill` |

**验收**：使用全部 Token 的测试卡片渲染正确；组件中不再硬编码颜色值。

---

### 步骤 3：搭建 i18n 基础设施

**目标**：项目从第一天开始即具备国际化结构，但 Phase 1 只启用英文。

**关键任务**

- 创建 `src/lib/i18n.ts`
- 创建 `src/lib/locales/en.json`
- 在根布局包裹 `NextIntlClientProvider`
- 根据需要添加 `src/middleware.ts`
- 约束所有 UI 字符串统一从 `en.json` 读取

**文案域**：`nav`、`explore`、`token`、`buy`、`sell`、`create`、`portfolio`、`error`、`state`、`tooltip`

**原则**：不做字符串拼接，统一使用模板插值；页面内不写新的硬编码业务文案。

**验收**：`useTranslations()` 可在任意页面工作；不出现新的硬编码用户文案。

---

### 步骤 4：创建目录结构、类型与配置

**目标**：形成可扩展的工程骨架。

**关键任务**

- 创建目录：`components/`、`hooks/`、`services/`、`stores/`、`config/`、`types/`、`utils/`
- 创建类型文件：`token.ts`、`curve.ts`、`trade.ts`、`api.ts`
- 创建配置文件：`chain.ts`、`contracts.ts`、`curve.ts`、`constants.ts`

**验收**：`npx tsc --noEmit` 无类型错误；类型定义可支撑全流程。

---

### 步骤 5：接入 XLayer 与钱包系统

**目标**：钱包可连接，网络可识别，Header 可展示连接状态。

**关键任务**

- 定义 XLayer Mainnet chain config。
- 配置 wagmi + RainbowKit。
- 建立 `QueryClientProvider`、`WagmiProvider`、`RainbowKitProvider`。
- 在 Header 中集成 `ConnectButton`。

**验收**：用户可连接钱包；非 XLayer 网络时有明确提示；连接成功后展示截断地址。

---

### 步骤 6：完成全局布局

**目标**：形成所有页面共享的导航骨架。

**关键组件**

- `Header`：Logo、导航、钱包入口、搜索入口
- `Footer`：合约地址、社交链接、GitHub
- `MobileNav`
- `SearchBar`：桌面端在 Tabs 右侧，移动端在列表上方

**验收**：`/`、`/create`、`/portfolio`、`/token/[address]` 均复用统一布局；移动端导航可正常使用；Header 固定在页面顶部。

---

## 10. 阶段二：核心服务与状态管理 — M2

### 步骤 7：实现曲线计算服务

**目标**：将 sat1 Bonding Curve 核心公式沉淀为纯函数。

**实现函数**：参见 [5.1 `curve.ts`](#51-curvets--曲线计算)

**验收**：输入相同参数必须稳定输出同一结果；与模块方案中的参考值一致。

---

### 步骤 8：实现链上交互服务

**目标**：把链上读写能力与 ABI 管理沉淀为服务层。

**实现模块**：

- `public-client.ts`：参见 [5.2](#52-public-clientts--链上只读)
- `contracts.ts`：参见 [5.3](#53-contractsts--合约交互)

**验收**：能对已知地址完成读操作；事件订阅接口可被业务层直接使用。

---

### 步骤 9：实现 Subgraph 服务

**目标**：沉淀列表、详情、历史、搜索、图表数据查询接口。

**实现模块**：参见 [5.4 `subgraph.ts`](#54-subgraphts--聚合数据)

**验收**：返回结构与页面消费模型一致；失败时具备降级路径。

---

### 步骤 10：建立 Zustand 状态管理

**目标**：形成页面级共享状态层。

**实现模块**：参见 [6. 状态层模块](#6-状态层模块)

**验收**：store 可独立被 selector 订阅；页面切换时状态更新可控、无明显脏数据残留。

---

## 11. 阶段三：共享组件与 Hooks — M2

### 步骤 11：实现共享组件库

**目标**：先完成跨页面通用组件，再开展页面集成。

**实现组件**：参见 [8. 共享组件](#8-共享组件)

**验收**：每个组件至少覆盖正常态、空态或错误态中的必要状态；组件风格统一遵循 dark card-based 设计。

---

### 步骤 12：实现自定义 Hooks

**目标**：将页面逻辑从组件中抽离。

**实现 Hooks**：参见 [7. Hook 层模块](#7-hook-层模块)

**验收**：页面组件主要负责渲染与交互，不直接承载复杂数据拼装逻辑；Hook 输入输出签名稳定，可单独测试。

---

## 12. 阶段四：Explore 页面 — M3

### 步骤 13：完成 Explore 页面骨架

**目标**：首页具备完整页面壳与基础状态。

**关键任务**

- 创建 `src/app/page.tsx`
- 建立 `loading.tsx`、`error.tsx`
- 创建 `TokenListSkeleton`
- 打通 Loading / Empty / Error / Normal 四态

**验收**：空列表时引导用户跳转 `/create`；错误时允许重试。

---

### 步骤 14：实现 ExploreTabs、TokenCard、TokenGrid

**目标**：首页可浏览代币列表。

**关键组件**

- `ExploreTabs`：`new / trending / graduating`
- `TokenCard`：头像、名称、Symbol、创建者、进度、价格、储备
- `TokenGrid`：响应式栅格布局
- 点击卡片跳转 `/token/[address]`

**验收**：默认 tab 为 `trending`；tab 切换同步 URL query；卡片 hover、毕业态、进度态表现正确。

---

### 步骤 15：接入搜索能力

**目标**：支持按名称或地址查找代币。

**关键任务**

- 输入后 300ms debounce
- 调用 `searchTokens()`
- 提供结果下拉与空结果提示

**验收**：已知代币名称、地址可跳转到详情页。

**数据流**

```text
URL tab 参数
→ useTokenList
→ subgraph 列表查询
→ curve.ts 计算 progress / price
→ TokenGrid / TokenCard 渲染
```

---

## 13. 阶段五：Token Detail 页面 — M4

### 步骤 16：实现 TokenHeader 与详情页骨架

**目标**：用户可以打开有效 SATPAD token 详情页。

**关键组件**

- `src/app/token/[address]/page.tsx`
- `TokenHeader`：头像、名称、Symbol、合约地址
- `TokenSocialLinks`：社交信息展示
- 无效地址显示 `EmptyState`；非法路由触发 `notFound()`

**验收**：头像、名称、Symbol、合约地址、社交信息展示正确。

---

### 步骤 17：实现进度与统计区

**目标**：展示曲线进度、统计卡片与毕业临界点。

**关键组件**

- `BondingCurveProgress`：进度条里程碑 `25 / 50 / 75 / 90 / 99`
- `TokenStats`：市值、持有者、交易量等统计

**验收**：进度条颜色阶段与模块方案一致；统计值与链上/聚合结果一致。

---

### 步骤 18：实现 TradePanel、BuyForm、SellForm

**目标**：打通买卖核心交互。

**关键组件**

- `TradePanel`：切换买卖 tab
- `BuyForm`：金额输入、quote、手续费、Price Impact、余额校验、毕业禁用
- `SellForm`：数量输入、快捷比例、quote、余额校验
- 集成 `FeeTooltip` 与 `PriceImpactBadge`

**验收**：买入限制 `<= 10 OKB`；用户拒绝交易与链上 revert 有清晰反馈；成功后刷新相关数据。

---

### 步骤 19：实现交易历史

**目标**：同时呈现历史记录与实时增量事件。

**关键组件**

- `TransactionHistory`
- `TransactionRow`
- WebSocket 事件追加 + subgraph 历史回填

**验收**：新交易可实时插入列表；历史记录倒序且字段完整。

---

### 步骤 20：实现 PriceChart

**目标**：展示边际价格与实际成交价。

**关键任务**

- 集成 `lightweight-charts`
- 时间粒度：`1m / 5m / 1h / 1d`
- 双线图：边际价格 + 实际均价

**验收**：图表渲染稳定，时间范围切换正常。

---

### 步骤 21：实现毕业状态页表现

**目标**：毕业代币在详情页有完整状态切换。

**关键组件**

- `GraduatedBanner`
- Buy 禁用、Sell 保留
- 进度条切换为毕业样式

**验收**：页面可明确区分"可买卖"与"仅可卖出"的状态。

**Token Detail 数据流**

```text
路由地址
→ useTokenDetail
→ public-client 读取链上数据
→ subgraph 获取历史与聚合
→ useTokenStore 聚合
→ Header / Stats / TradePanel / History / Chart 渲染
```

---

## 14. 阶段六：Create Token 页面 — M5

### 步骤 22：完成 Step 1 基础信息

**目标**：用户可填写代币基础资料并上传图片。

**关键组件**

- `CreateStepper`
- `StepBasicInfo`

**校验规则**

| 字段 | 规则 |
|------|------|
| Name | 1-32 字符 |
| Symbol | 1-8 字符，自动大写，A-Z only |
| Description | 最大 280 字符 |
| 图片 | PNG/JPG，最大 2MB，裁剪至 512x512 |

**验收**：表单验证生效；图片上传、压缩、裁剪流程可用。

---

### 步骤 23：完成 Step 2-3 社交信息与曲线预览

**目标**：让用户完成可选社交信息，并理解部署后的曲线参数。

**关键组件**

- `StepSocialInfo`
- `StepCurvePreview`
- 展示固定参数：`K=21M`、`S=100 OKB`、`Fee=0.3%`
- 展示关键价格预览点与小型曲线图

**验收**：社交 URL 校验正确；曲线预览数值与服务层公式一致。

---

### 步骤 24：完成 Step 4 部署闭环

**目标**：创建代币流程可真正落链并跳转详情页。

**关键组件**：`StepDeploy`

**流程**

```text
表单输入
→ validate.ts 校验
→ 图片处理 / IPFS 上传
→ metadata JSON 组装
→ deploy()
→ 解析事件日志
→ 跳转 /token/[address]
```

**状态要求**：等待钱包确认 → 交易 pending → 交易成功 / 交易失败

**验收**：真实或测试环境下可完成一条闭环部署；钱包未连接不允许进入部署态；任一上传或交易失败都可恢复或重试。

---

## 15. 阶段七：Portfolio 页面 — M6

### 步骤 25：实现资产概览与持仓列表

**目标**：用户可查看持仓与未实现盈亏。

**关键组件**

- `PortfolioSummary`：总资产、总投入、未实现 P&L、持仓数量
- `HoldingsList`
- `HoldingCard`
- 状态：空状态、未连接状态、正常状态

**验收**：未连接钱包有明确引导；无持仓时展示空状态而不是空白页。

---

### 步骤 26：实现 PortfolioHistory

**目标**：展示当前钱包的全量交易记录。

**关键组件**

- `PortfolioHistory`
- 复用 `TransactionRow`
- 支持按时间倒序展示
- 可选补充 `UnrealizedPnL` 详情视图

**验收**：用户维度交易历史数据完整、结构统一。

**Portfolio 数据流**

```text
钱包地址
→ subgraph 查询用户相关交易
→ public-client 补充余额与链上状态
→ curve.ts 计算当前价值与 P&L
→ Summary / Holdings / History 渲染
```

---

## 16. 阶段八：打磨与上线 — M7 / M8

### 步骤 27：补齐错误处理与边界情况

**覆盖场景**

| 场景 | 处理策略 |
|------|----------|
| 无效合约地址 | EmptyState + 引导 |
| RPC 不可用 | 切备用 RPC 或提示重试 |
| 用户拒绝交易 | 展示明确取消提示 |
| 交易 revert | 解析原因并转成用户可读文本 |
| IPFS 上传失败 | 允许重试，不清空已填数据 |
| Subgraph 查询失败 | 退回链上读取的最小可用模式 |
| 错误网络 | 明确提示切换网络 |
| 图片加载失败 | 统一 fallback |
| TokenURI 解析失败 | 显示链上原始最小信息 |
| 局部渲染错误 | `ErrorBoundary` |
| 页面级错误 | `error.tsx` |

**验收**：所有关键异常均有用户可理解反馈。

---

### 步骤 28：补齐响应式适配

**断点**：`sm(640)` / `md(768)` / `lg(1024)` / `xl(1280)` / `2xl(1536)`

| 页面 | 适配要点 |
|------|----------|
| Explore | 列表单列化、Tab 横向滚动、搜索条全宽 |
| Token Detail | 双列转单列，移动端 TradePanel sticky/bottom sheet |
| Create | Stepper 紧凑化，仅保留步骤号 |
| Portfolio | 概览卡与持仓卡片压缩信息密度 |

**验收**：小屏无横向溢出、关键 CTA 可点、信息不丢失。

---

### 步骤 29：补齐动画与微交互

| 交互 | 时长 |
|------|------|
| 卡片 Hover | 150ms |
| 按钮 Hover | 150ms |
| Tab 切换 | 200ms |
| 进度条变化 | 700ms |
| Toast 滑入 | 300ms |
| 交易记录插入 | 动画追加 |
| Skeleton → 内容 | 淡入过渡 |
| 数值变化 | 高亮闪烁 |

**验收**：交互统一、无明显跳变、无性能问题。

---

### 步骤 30：SEO 与最终验收

**页面 metadata**

| 页面 | 标题 |
|------|------|
| Explore | `SATPAD — Permissionless Token Launchpad on XLayer` |
| Token Detail | `[Symbol] — SATPAD` |
| Create | `Create Token — SATPAD` |
| Portfolio | `My Portfolio — SATPAD` |

**最终技术验收**

- `npx tsc --noEmit` 通过
- `npm run build` 通过
- 全页面 Loading / Empty / Error 状态检查
- 深色主题一致性检查
- 页面元信息完整

---

## 17. 数据流与刷新策略

### 17.1 Explore 数据流

```text
URL tab 参数
→ useTokenList
→ subgraph 列表查询
→ curve.ts 计算 progress / price
→ TokenGrid / TokenCard 渲染
```

### 17.2 Token Detail 数据流

```text
路由地址
→ useTokenDetail
→ public-client 读取链上数据
→ subgraph 获取历史与聚合
→ useTokenStore 聚合
→ Header / Stats / TradePanel / History / Chart 渲染
```

### 17.3 Create 数据流

```text
表单输入
→ validate.ts 校验
→ 图片处理 / IPFS 上传
→ metadata JSON 组装
→ deploy()
→ 解析事件日志
→ 跳转 /token/[address]
```

### 17.4 Portfolio 数据流

```text
钱包地址
→ subgraph 查询用户相关交易
→ public-client 补充余额与链上状态
→ curve.ts 计算当前价值与 P&L
→ Summary / Holdings / History 渲染
```

### 17.5 刷新策略

| 数据项 | 来源 | 方式 | 建议频率 |
|--------|------|------|----------|
| `okbCum` | 链上 | 轮询 / per block | 3s |
| Mint/Burn 事件 | 链上 | WebSocket 订阅 | 实时 |
| Token 列表 | Subgraph | 轮询 | 5s |
| 搜索结果 | Subgraph | debounce 请求 | 300ms |
| 用户持仓 | Subgraph + 链上 | 轮询 | 10s |
| 图表数据 | Subgraph | 按需请求 | 切换时 |

**策略要求**：链上数据优先保证正确性；Subgraph 数据优先保证聚合能力；页面需要具备链上兜底路径。

---

## 18. 页面状态矩阵

| 页面 | Loading | Empty | Error | 特殊状态 |
|------|---------|-------|-------|----------|
| Explore | `TokenListSkeleton` | 空列表引导创建 | Toast + Retry | tab/search 切换 |
| Token Detail | 详情骨架 | Invalid Token EmptyState | ErrorBoundary | Graduated |
| Create | Step 骨架或禁用态 | 不适用 | 提交失败可重试 | Wallet 未连接 |
| Portfolio | 资产骨架 | No Holdings EmptyState | Toast + Retry | Wallet 未连接 |

---

## 19. 关键依赖关系

```text
步骤 1 项目初始化
├── 步骤 2 设计 Token
├── 步骤 3 i18n 基础设施
├── 步骤 4 目录 / 类型 / 配置
│   ├── 步骤 5 钱包接入
│   ├── 步骤 7 曲线服务
│   ├── 步骤 8 链上服务
│   ├── 步骤 9 Subgraph 服务
│   └── 步骤 10 Zustand Stores
├── 步骤 6 全局布局
│
├── 步骤 11 共享组件
├── 步骤 12 自定义 Hooks
│
├── 步骤 13 Explore 骨架
│   ├── 步骤 14 Explore 列表能力
│   └── 步骤 15 搜索能力
│
├── 步骤 16 Token Detail 骨架
│   ├── 步骤 17 进度与统计
│   ├── 步骤 18 TradePanel
│   ├── 步骤 19 交易历史
│   ├── 步骤 20 PriceChart
│   └── 步骤 21 毕业态
│
├── 步骤 22 Create Step 1
│   ├── 步骤 23 Create Step 2-3
│   └── 步骤 24 Create Step 4
│
├── 步骤 25 Portfolio Summary / Holdings
│   └── 步骤 26 Portfolio History
│
└── 步骤 27-30 上线前打磨
```

---

## 20. 里程碑与时间线

### 20.1 里程碑定义

| 里程碑 | 完成条件 | 对外可演示内容 |
|--------|----------|----------------|
| M1 | 步骤 1-6 完成 | 可运行站点、统一布局、可连接钱包 |
| M2 | 步骤 7-12 完成 | 曲线服务、链上读写、共享组件、核心 hooks |
| M3 | 步骤 13-15 完成 | 首页可浏览、切 tab、搜索代币 |
| M4 | 步骤 16-21 完成 | 详情页、买卖、历史、图表、毕业态 |
| M5 | 步骤 22-24 完成 | 创建代币四步流程闭环 |
| M6 | 步骤 25-26 完成 | 资产页与用户历史 |
| M7 | 步骤 27-29 完成 | 异常、响应式、动效打磨 |
| M8 | 步骤 30 完成 | 构建通过、SEO 补齐、具备上线条件 |

### 20.2 建议时间线

| 周次 | 阶段 | 重点内容 | 里程碑 |
|------|------|----------|--------|
| 第 1 周 | 阶段一 | 项目脚手架、设计 Token、i18n、布局、钱包 | M1 |
| 第 2 周 | 阶段二 | 曲线、链上服务、Subgraph、状态管理 | M2 |
| 第 3 周 | 阶段三 + 阶段四 | 共享组件、Hooks、Explore 全流程 | M3 |
| 第 4-5 周 | 阶段五 | Token Detail 全流程与实时数据 | M4 |
| 第 6 周 | 阶段六 | Create 全流程、部署闭环 | M5 |
| 第 7 周 | 阶段七 | Portfolio 页面 | M6 |
| 第 8 周 | 阶段八 | 异常、响应式、动效、SEO、联调验收 | M7 / M8 |

---

## 21. 最终验收清单

- [ ] 所有页面路由可访问
- [ ] 钱包连接与网络提示正常
- [ ] Explore 可浏览、筛选、搜索
- [ ] Token Detail 可查看、买卖、看历史、看图表
- [ ] Create 可上传图片、填写信息、部署代币
- [ ] Portfolio 可查看持仓与历史
- [ ] 所有关键异常有提示与回退
- [ ] 移动端主流程可用
- [ ] 曲线公式服务与参考值一致
- [ ] 响应式与动画达到设计预期
- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过

---

> 文档状态：由 `SATPAD逐步实现计划.md` 与 `SATPAD前端实施计划.md` 整合而成
>
> 更新日期：2026-05-12
>
> 用途：SATPAD 前端唯一实施方案，涵盖架构、模块、阶段、验收全维度
