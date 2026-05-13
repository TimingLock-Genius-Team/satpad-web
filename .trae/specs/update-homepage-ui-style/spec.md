# Homepage UI Style Update Spec

## Why
用户希望首页的 UI 风格能够与参考图片（four.meme）保持一致，同时结合已有的前端模块与实施方案进行调整。当前系统虽然已经搭建了基础的深色卡片布局，但缺乏左侧侧边栏导航、顶部滚动跑马灯、醒目的英雄区（包含大号 Create Token 按钮及宣传 Banner）、以及符合参考图的霓虹绿主色调和复杂的筛选过滤区。

## What Changes
- **布局重构 (Layout)**：
  - 从顶底布局（Header + Main + Footer）切换为 左侧边栏 + 顶部跑马灯 + 主内容区 的布局架构。
  - 左侧边栏 (Sidebar) 包含：Home, Agentic, Ranking, Advanced, Campaign, Announcement 等导航项。
- **主题色调整 (Theme)**：
  - 更新 Tailwind 的主强调色 `--accent-primary` 为霓虹绿色（如 `#00FF66`），以匹配参考图中的 Create Token 按钮和进度条高亮色。
- **跑马灯组件 (Marquee)**：
  - 顶部增加实时的交易跑马灯展示（谁买了/卖了什么代币）。
- **英雄区 (Hero Section)**：
  - 增加一个具有明显视觉冲击力的 `>> Create Token <<` 按钮区域。
  - 增加宣传 Banner 占位图（如 "TRADE & PREDICT LUCKY DRAW"）。
- **筛选与控制区 (Filter & Tabs)**：
  - 增加类似参考图的 Toggle 开关（如 "Listed on PancakeSwap" 概念，可以替换为 SATPAD 相关的筛选）。
  - 增加 Tag 过滤栏（如 humans, just 等分类标签）。
  - 增加右侧的过滤下拉菜单及列表/网格视图切换按钮。
- **TokenCard 细节调整**：
  - 对齐参考图中的代币卡片布局细节（如市场进度条的视觉表现、右下角图标、价格变化标识）。

## Impact
- Affected specs: 首页布局、全局 Layout、主题配置文件 `tailwind.config.ts`。
- Affected code:
  - `src/app/layout.tsx` (结构变为 Sidebar + Main)
  - `tailwind.config.ts` 和 `globals.css`
  - `src/app/page.tsx` (增加 Hero 区、跑马灯、Filter 区)
  - `src/components/layout/` (新增 Sidebar, Marquee)
  - `src/components/explore/TokenCard.tsx` (样式细节调整)

## ADDED Requirements
### Requirement: Sidebar Navigation
系统应提供固定在左侧的导航栏，适应桌面端展示，并在移动端折叠为抽屉菜单。

### Requirement: Marquee Ticker
系统应在顶部提供一个滚动的交易播报跑马灯组件。

### Requirement: Hero Section & Filters
系统应在首页上方提供醒目的 Create Token 入口及宣传 Banner，并在代币列表上方提供多维度的筛选和视图切换控件。

## MODIFIED Requirements
### Requirement: Global Theme Colors
系统的主强调色从蓝色更新为参考图中的霓虹绿色，确保进度条、主按钮视觉统一。
