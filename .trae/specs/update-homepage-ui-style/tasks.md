# Tasks
- [x] Task 1: 更新全局主题与颜色
  - [x] SubTask 1.1: 更新 `tailwind.config.ts` 和 `globals.css`，将 `--accent-primary` 调整为霓虹绿（如 `#00FF66`），调整其他卡片背景色以贴合参考图。
  
- [x] Task 2: 重构全局布局 (Sidebar & Marquee)
  - [x] SubTask 2.1: 创建 `Sidebar` 组件，包含 Home, Agentic, Ranking 等导航项。
  - [x] SubTask 2.2: 创建 `MarqueeTicker` 跑马灯组件，用于展示模拟的实时交易信息。
  - [x] SubTask 2.3: 更新 `src/app/layout.tsx`，将布局结构从上下结构更改为 `Sidebar + (Marquee + Header + Main)` 结构。

- [x] Task 3: 构建首页 Hero 区与筛选栏
  - [x] SubTask 3.1: 在首页添加大号 `>> Create Token <<` 入口和宣传 Banner。
  - [x] SubTask 3.2: 更新搜索栏与筛选区，增加 Tag 过滤器（如 humans, just 等）和列表/网格视图切换按钮。

- [x] Task 4: 更新 TokenCard 及列表细节
  - [x] SubTask 4.1: 调整 `TokenCard` 样式，使其与参考图严格对齐（市场占有率、进度条颜色、作者地址截断样式等）。
  - [x] SubTask 4.2: 完善响应式适配，确保左侧边栏在移动端能优雅收起或转换为底部导航。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 1]
