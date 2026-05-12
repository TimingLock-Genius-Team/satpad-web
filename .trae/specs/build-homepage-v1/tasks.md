# Tasks
- [x] Task 1: 项目初始化与基础设施搭建
  - [x] SubTask 1.1: 初始化 Next.js 14 App Router 项目（包含 TypeScript、Tailwind CSS）。
  - [x] SubTask 1.2: 安装基础依赖（`lucide-react`, `clsx`, `tailwind-merge` 等），并创建 `src/utils/cn.ts`。
  - [x] SubTask 1.3: 配置 `tailwind.config.ts` 和 `globals.css` 中的设计 Token（颜色、间距、圆角）。
  - [x] SubTask 1.4: 创建标准的项目目录结构（components, config, types, utils 等）。

- [x] Task 2: 共享组件与全局布局
  - [x] SubTask 2.1: 实现全局 `Header`（包含 Logo、导航链接、钱包连接占位按钮）。
  - [x] SubTask 2.2: 实现全局 `Footer`。
  - [x] SubTask 2.3: 在 `src/app/layout.tsx` 中引入 Header 和 Footer，形成统一的页面骨架。

- [x] Task 3: 首页组件库与数据模型
  - [x] SubTask 3.1: 创建代币类型定义 `src/types/token.ts`，并编写 Mock 列表数据。
  - [x] SubTask 3.2: 实现 `TokenCard` 组件，展示代币信息及 bonding curve 进度占位。
  - [x] SubTask 3.3: 实现 `TokenGrid` 响应式网格组件。
  - [x] SubTask 3.4: 实现 `ExploreTabs` 和 `SearchBar` 组件。

- [x] Task 4: 首页集成
  - [x] SubTask 4.1: 在 `src/app/page.tsx` 中组合上述组件，渲染完整的 Explore 页面。
  - [x] SubTask 4.2: 补充基础的 `loading.tsx` 或骨架屏占位（可选）。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 4] depends on [Task 2] and [Task 3]
