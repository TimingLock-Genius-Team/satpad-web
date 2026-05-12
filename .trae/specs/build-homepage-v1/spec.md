# 首页（Explore Page）v1 Spec

## Why
当前项目仓库内仅存在产品文档，尚无前端源码。为了快速跑通项目骨架，并提供可视化的界面基础，需要从零搭建 Next.js 项目，并实现产品首页（Explore Page）的第一个 UI 版本。这将为后续接入智能合约交互和真实的 Subgraph 数据打下基础。

## What Changes
- 初始化 Next.js 14 (App Router) + TypeScript + Tailwind CSS 项目。
- 建立项目的基础目录规范（`src/components`, `src/hooks`, `src/types`, `src/utils` 等）。
- 落地 Tailwind CSS 设计系统 Token（颜色、排版、圆角等）。
- 实现全局布局（Header、Footer）。
- 实现首页核心 UI 模块：`ExploreTabs`、`TokenGrid`、`TokenCard`、`SearchBar`。
- 引入基础 Mock 数据使得首页具备可预览的完整形态。

## Impact
- Affected specs: 对应前端实施方案中的 `阶段一`（项目初始化）与 `阶段四`（Explore 页面 UI）。
- Affected code: 项目根目录配置文件，以及 `src/app`, `src/components`, `src/types`。

## ADDED Requirements
### Requirement: 项目基础设施
系统 SHALL 基于 Next.js 14 提供可运行的 React 环境，并配置 Tailwind CSS，满足响应式开发的需要。

### Requirement: 首页核心展示
系统 SHALL 提供一个代币浏览首页：
#### Scenario: 浏览首页列表
- **WHEN** 用户访问 `/`
- **THEN** 页面顶部应展示全局导航栏（含 Logo 与 占位钱包按钮），页面主体部分展示代币列表 Tabs（new / trending / graduating）、搜索框，以及通过响应式网格排列的代币卡片（TokenCard）。代币卡片上应清晰展示头像、名称、Symbol、进度、价格等信息。
