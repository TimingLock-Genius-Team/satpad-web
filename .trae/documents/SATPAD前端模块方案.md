# SATPAD Frontend Module & Component Design

> Full-stack frontend architecture based on the SATPAD Product Design Doc (page + component level)

---

## 1. Overview

### 1.1 Project Summary

- **Project**: SATPAD — Permissionless token launchpad on XLayer using sat1 Bonding Curve
- **Stack**: Next.js 14 (App Router) + React 18 + TypeScript + viem + wagmi v2 + RainbowKit/ConnectKit
- **Network**: XLayer Mainnet
- **Reference**: pump.fun / sat1.io
- **Language**: English (i18n infrastructure via `next-intl` set up from Phase 1, ready for multi-language expansion)

### 1.2 Page Architecture

```
SATPAD Frontend
├── /                       Explore Page
│   ├── ?tab=new            Newly Listed
│   ├── ?tab=trending       Trending
│   └── ?tab=graduating     About to Graduate
├── /token/:address         Token Detail Page
├── /create                 Create Token Page
└── /portfolio              Portfolio Page
```

### 1.3 Global Layout Components

- **Header**: Logo, nav (Explore / Create / Portfolio), wallet connect button, search entry
- **Footer**: Contract addresses (Verified links), social links, GitHub repo link
- **Layout**: Header + `<main>` + Footer wrapper

---

## 2. Technical Layering

```
┌─────────────────────────────────────────────┐
│  UI Layer         pages / components        │
├─────────────────────────────────────────────┤
│  State Layer      zustand stores / context   │
├─────────────────────────────────────────────┤
│  Service Layer    on-chain reads/writes      │
│                   (viem publicClient +       │
│                    walletClient via wagmi)    │
├─────────────────────────────────────────────┤
│  Data Layer       subgraph queries           │
│                   (The Graph / Ponder)       │
│                   WebSocket event stream     │
├─────────────────────────────────────────────┤
│  Contract Layer   sat1 Hook Deployer ABI     │
│                   sat1 ERC-20 Hook ABI       │
│                   Uniswap V4 ABI             │
└─────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Header + Footer + Providers)
│   ├── page.tsx                  # Explore Page /
│   ├── create/
│   │   └── page.tsx              # Create Token /create
│   ├── portfolio/
│   │   └── page.tsx              # Portfolio /portfolio
│   └── token/
│       └── [address]/
│           └── page.tsx          # Token Detail /token/:address
│
├── components/
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileNav.tsx
│   │   └── SearchBar.tsx
│   │
│   ├── explore/                  # Explore page components
│   │   ├── ExploreTabs.tsx
│   │   ├── TokenCard.tsx
│   │   ├── TokenGrid.tsx
│   │   └── TokenListSkeleton.tsx
│   │
│   ├── token-detail/             # Token detail page components
│   │   ├── TokenHeader.tsx
│   │   ├── TokenSocialLinks.tsx
│   │   ├── BondingCurveProgress.tsx
│   │   ├── PriceChart.tsx
│   │   ├── TradePanel.tsx
│   │   ├── BuyForm.tsx
│   │   ├── SellForm.tsx
│   │   ├── TokenStats.tsx
│   │   ├── TransactionHistory.tsx
│   │   ├── TransactionRow.tsx
│   │   └── GraduatedBanner.tsx
│   │
│   ├── create/                   # Create token page components
│   │   ├── CreateStepper.tsx
│   │   ├── StepBasicInfo.tsx
│   │   ├── StepSocialInfo.tsx
│   │   ├── StepCurvePreview.tsx
│   │   └── StepDeploy.tsx
│   │
│   ├── portfolio/                # Portfolio page components
│   │   ├── PortfolioSummary.tsx
│   │   ├── HoldingsList.tsx
│   │   ├── HoldingCard.tsx
│   │   ├── PortfolioHistory.tsx
│   │   └── UnrealizedPnL.tsx
│   │
│   └── shared/                   # Shared components
│       ├── CopyAddress.tsx
│       ├── PriceImpactBadge.tsx
│       ├── FeeTooltip.tsx
│       ├── CurveExplainCollapse.tsx
│       ├── WelcomeModal.tsx
│       ├── TokenAvatar.tsx
│       ├── AddressDisplay.tsx
│       ├── CountdownTimer.tsx
│       ├── Skeleton.tsx
│       ├── ErrorBoundary.tsx
│       ├── EmptyState.tsx
│       └── VerifiedContractLink.tsx
│
├── hooks/                        # Custom hooks
│   ├── useBondingCurve.ts
│   ├── useTokenList.ts
│   ├── useTokenDetail.ts
│   ├── useTradeQuote.ts
│   ├── useTransactionHistory.ts
│   ├── usePortfolio.ts
│   ├── useCreateToken.ts
│   ├── useTokenEvents.ts
│   └── useDebounce.ts
│
├── lib/                          # i18n (next-intl)
│   ├── i18n.ts
│   └── locales/
│       └── en.json               # English (default)
│
├── services/                     # Service layer
│   ├── curve.ts                  # sat1 curve pure functions
│   ├── contracts.ts              # Contract ABI + address management
│   ├── public-client.ts          # viem publicClient instance
│   ├── subgraph.ts               # Subgraph query wrapper
│   └── events.ts                 # WebSocket event subscription
│
├── stores/                       # State management (zustand)
│   ├── useWalletStore.ts
│   ├── useExploreStore.ts
│   └── useTokenStore.ts
│
├── config/                       # Configuration
│   ├── chain.ts                  # XLayer mainnet config
│   ├── contracts.ts              # Contract addresses
│   ├── curve.ts                  # Curve param constants (K=21M, S=100)
│   └── constants.ts              # Fee rates, limits, etc.
│
├── types/                        # TypeScript types
│   ├── token.ts
│   ├── curve.ts
│   ├── trade.ts
│   └── api.ts
│
└── utils/                        # Utilities
    ├── format.ts                 # Number formatting
    ├── address.ts                # Address truncation
    ├── image.ts                  # IPFS / image processing
    ├── cn.ts                     # className merge utility
    └── validate.ts               # Form validation
```

---

## 4. UI Design System (Inspired by four.meme)

> Platform UI style reference: [four.meme](https://four.meme/en) — dark-themed, card-based modular layout with data-driven visual hierarchy.

### 4.1 Design Philosophy

| Principle | Description |
|-----------|-------------|
| **Dark-First** | Dark backgrounds reduce eye strain and create a premium, data-dashboard aesthetic |
| **Card Modularity** | Every data entity (token, stat, position) lives in a bordered card |
| **Data as Visual** | Progress bars, price deltas, and metrics are the primary visual elements — not decorative graphics |
| **Low Cognitive Load** | Simple layouts, clear hierarchy, minimal chrome — users find what they need at a glance |
| **Trust Signals** | Contract addresses always visible/verifiable, fee breakdowns always shown |

### 4.2 Color Token System

All colors defined as Tailwind CSS custom tokens in `tailwind.config.ts`. No hardcoded hex values in components.

#### Base Palette

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `--bg-base` | `#0D0D0F` | `bg-surface-base` | Page background, root layout |
| `--bg-surface` | `#1A1A1E` | `bg-surface` | Card backgrounds, panels |
| `--bg-elevated` | `#242429` | `bg-surface-elevated` | Hover states, active cards, dropdowns |
| `--bg-highlight` | `#2E2E34` | `bg-surface-highlight` | Selected items, focused inputs |

#### Text & Border

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `--text-primary` | `#F5F5F5` | `text-primary` | Headings, key values, button labels |
| `--text-secondary` | `#9CA3AF` | `text-secondary` | Descriptions, labels, secondary info |
| `--text-tertiary` | `#6B7280` | `text-tertiary` | Timestamps, addresses, metadata |
| `--border-default` | `#2A2A30` | `border-default` | Card borders, input borders, dividers |
| `--border-hover` | `#3F3F46` | `border-hover` | Hovered card borders |

#### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent-primary` | `#3B82F6` | Primary buttons, active tabs, links |
| `--accent-success` | `#22C55E` | Buy indicators, positive P&L, graduation |
| `--accent-warning` | `#F59E0B` | Medium price impact (5–15%), pending states |
| `--accent-danger` | `#EF4444` | High price impact (>15%), sell indicators, errors |

#### Bonding Curve Progress Gradient

```
0% – 50%:   #3B82F6 (blue)    → Exploration phase
50% – 75%:  #8B5CF6 (purple)  → Momentum phase
75% – 90%:  #F59E0B (orange)  → Acceleration phase
90% – 99%:  #EF4444 (red)     → Final sprint
99%+:       #22C55E (green)   → Graduated
```

### 4.3 Typography

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Heading 1 | 36px | 700 | 1.2 | Page titles |
| Heading 2 | 24px | 600 | 1.3 | Section titles, token name in detail |
| Heading 3 | 20px | 600 | 1.3 | Card titles |
| Heading 4 | 16px | 600 | 1.4 | Sub-section labels |
| Body | 14px | 400 | 1.5 | Primary body text, descriptions |
| Body Small | 12px | 400 | 1.5 | Secondary info, timestamps, addresses |
| Mono | 14px | 500 | — | Token amounts, prices, addresses (JetBrains Mono / monospace) |

**Font Family**: `Inter` (headings + body) + `JetBrains Mono` (data values). Both loaded via `next/font/google`.

### 4.4 Spacing & Layout Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-card` | `12px` | Card containers, modals, panels |
| `--radius-input` | `8px` | Inputs, buttons, select dropdowns |
| `--radius-pill` | `9999px` | Badges, tags, status indicators |
| `--page-max-width` | `1280px` | Content container max-width |
| `--card-gap` | `16px` | Grid gap between cards |
| `--section-gap` | `32px` | Vertical gap between page sections |

### 4.5 Elevation & Depth

four.meme uses a flat design with subtle borders — no heavy box-shadows. Cards and panels are distinguished from the background by background color elevation, not shadow depth.

```
Base (bg-base)         ← Page background
  └── Surface (bg-surface)    ← Cards, panels, forms
       └── Elevated (bg-elevated)  ← Hover state, active card, dropdown
            └── Highlight (bg-highlight) ← Selected, focused
```

- **Cards**: `border border-default`, on hover → `border-hover` + `bg-elevated` transition (150ms ease)
- **No drop-shadows**: Rely on background color difference for depth
- **Input focus**: `ring-2 ring-accent-primary/50 border-accent-primary` transition

### 4.6 Core Component Visual Patterns

#### TokenCard (four.meme Style)

```
┌──────────────────────────────────────┐
│  ┌────┐                              │
│  │    │  Token Name       $SYMBOL    │
│  │ AV │  created by 0x1234...abcd    │
│  └────┘                              │
│                                      │
│  Market cap: 12.5 OKB                │
│  ████████████░░░░░░░░  62.3%         │
│                                      │
│  +5.2%                               │
└──────────────────────────────────────┘
```

- **Avatar**: 40×40 rounded-full, left-aligned with name/symbol stack to the right
- **Creator line**: `text-tertiary text-sm`, truncated address
- **Progress bar**: `h-1.5 rounded-full`, gradient based on progress percentage
- **Market cap**: `text-primary text-base font-mono font-medium`
- **Price change**: Green for positive, Red for negative, pill badge format

#### BondingCurveProgress (Detail View)

```
Graduation ████████████████░░░░░  78.5%  ● 75%
            0%                                    99%
```

- **Height**: `h-2` (thicker than card variant)
- **Milestone dots**: Positioned at 25%, 50%, 75%, 90%, 99% with labels
- **Gradient fill**: Changes color by progress phase (blue → purple → orange → red → green)
- **Current position**: White dot indicator on the bar
- **Tooltip on hover**: Exact percentage + "X / 21,000,000 minted"

#### TradePanel

```
┌──────────────────────────────────────┐
│  [ Buy ]  [ Sell ]                   │  ← Tab switch
│                                      │
│  You pay                             │
│  ┌──────────────────────────────┐    │
│  │  [OKB ▼]  0.0               │    │  ← Input with token selector
│  └──────────────────────────────┘    │
│                                      │
│  You receive                         │
│  ┌──────────────────────────────┐    │
│  │  [TOKEN ▼]  0.0             │    │  ← Quote output
│  └──────────────────────────────┘    │
│                                      │
│  Fee: 0.3%         Price Impact: 2%  │  ← Info row
│                                      │
│  [████████████░░░░] Connect Wallet   │  ← CTA button
└──────────────────────────────────────┘
```

- **Tabs**: Underline style, no background, `text-secondary` → `text-primary + border-b-2 border-accent-primary` when active
- **Input**: `bg-base` background inside `bg-surface` panel, inset feel
- **Quote row**: Read-only, `bg-base` background, muted text until value present
- **CTA Button**: Full-width, `bg-accent-primary` with `hover:brightness-110`, `h-12` height
- **Fee row**: `text-tertiary text-xs` with `FeeTooltip` trigger icon

#### TokenGrid Layout

```
Desktop (≥1024px):           Tablet (768-1023px):          Mobile (<768px):
┌─────┬─────┬─────┬─────┐   ┌─────┬─────┬─────┐         ┌──────────┐
│Card │Card │Card │Card │   │Card │Card │Card │         │  Card    │
├─────┼─────┼─────┼─────┤   ├─────┼─────┼─────┤         ├──────────┤
│Card │Card │Card │Card │   │Card │Card │     │         │  Card    │
└─────┴─────┴─────┴─────┘   └─────┴─────┴─────┘         └──────────┘
  4 columns, 16px gap         3 columns, 16px gap          1 column
```

### 4.7 Iconography & Visual Elements

- **Icons**: [Lucide](https://lucide.dev/) — consistent stroke-based icon set, renders at any size cleanly
- **Avatar fallback**: First letter of symbol on `bg-elevated` circle with `text-secondary`
- **Loading skeletons**: `bg-elevated` with `animate-pulse`, matching card dimensions exactly
- **Success indicators**: Green checkmark or green flash animation
- **Error indicators**: Red border flash + inline error text
- **Transaction types**: Green ↑ (Buy) / Red ↓ (Sell) arrow indicators

### 4.8 Animation & Micro-interactions

| Element | Animation |
|---------|-----------|
| Card hover | `border-hover` color transition, 150ms ease |
| Button hover | `brightness(1.1)` scale, 150ms ease |
| Progress bar fill | `transition-[width] duration-700 ease-out` |
| Tab switch | `border-bottom` slide, 200ms ease |
| Value change (price, P&L) | Flash highlight (green/red), 500ms fade |
| Toast notification | Slide in from top-right, 300ms ease |
| Transaction append | Slide in from top in transaction list |
| Skeleton → Content | Cross-fade, 300ms ease |

### 4.9 Responsive Breakpoints (Tailwind Defaults)

| Breakpoint | Min Width | Layout Behavior |
|------------|-----------|-----------------|
| `sm` | 640px | Single column, condensed cards |
| `md` | 768px | Single column, full cards |
| `lg` | 1024px | Two-column (Token Detail), 3-column card grid |
| `xl` | 1280px | Full two-column, 4-column card grid |
| `2xl` | 1536px | Wider content area, 5-column card grid |

---

## 5. Page Module Detailed Design

---

### 5.1 Explore Page `/`

**Route**: `/` + query param `?tab=new | trending | graduating`

#### Page States

| State | Component Behavior |
|-------|-------------------|
| **Loading** | `TokenListSkeleton` (12 skeleton cards in grid) |
| **Empty** | `EmptyState` ("No tokens yet. Be the first to create one!" + CTA button → `/create`) |
| **Error** | Error toast + retry button |
| **Normal** | TokenGrid renders cards |

#### Component Tree

```
ExplorePage
├── ExploreTabs          ← Tab switch: New / Trending / Graduating
├── SearchBar            ← Search (name/address), debounced
└── TokenGrid
    └── TokenCard[]      ← Each card loads independently
```

#### Component Details

##### ExploreTabs
- **Interaction**: Three tabs, click updates URL `?tab=` param
- **Visual style**: Underline tab pattern — inactive: `text-secondary`, active: `text-primary border-b-2 border-accent-primary`. Tab switch animated with `transition-all duration-200 ease`. Tab container has bottom border `border-default` as track line.
- **Tab definitions**:
  | Tab | Param | Sort Logic |
  |-----|-------|-------------|
  | 🆕 New | `new` | `createdAt` descending |
  | 🔥 Trending | `trending` | 24h tx count / volume descending |
  | 🚀 Graduating | `graduating` | `totalMinted / K` descending (show only >50%) |
- **Default**: `trending` when no param

##### SearchBar
- **Position**: Right of ExploreTabs (desktop) / top fixed (mobile)
- **Interaction**: 300ms debounce → subgraph query
- **Search fields**: Token name (fuzzy) | Contract address (exact)
- **Results**: Dropdown panel with match list, click → `/token/:address`

##### TokenCard
- **Visual style**: `bg-surface border border-default rounded-card` with `hover:border-hover hover:bg-elevated` transition (150ms ease). See Section 4.6 for visual mockup.
- **Data source**: Subgraph query + on-chain real-time `okbCum`
- **Display fields**:
  | Field | Source | Freshness |
  |-------|--------|-----------|
  | Token avatar | IPFS / metadata URI | Static |
  | Name + Symbol | metadata | Static |
  | Creator address (truncated) | subgraph | Static |
  | Curve progress bar | `totalMinted / K` | **Real-time** (WebSocket) |
  | Current marginal price (OKB) | `marginalPrice(okbCum)` | **Real-time** |
  | Reserve (OKB) | `okbCum` | **Real-time** |
  | 24h volume | subgraph aggregation | Near real-time (5s polling) |
  | 24h tx count | subgraph aggregation | Near real-time |
- **Graduated badge**: Progress >= 99% → "🎓 Graduated" badge
- **Click**: Entire card clickable → navigate to `/token/:address`

##### TokenListSkeleton
- 12-column grid layout
- Each skeleton mimics card shape (circle avatar + text bars + progress bar)

---

### 5.2 Token Detail Page `/token/:address`

**Route**: `/token/:address` (dynamic route, `:address` = contract address)

#### Page States

| State | Component Behavior |
|-------|-------------------|
| **Loading** | Full page skeleton |
| **Invalid contract** | `EmptyState` ("This address is not a valid SATPAD token") |
| **404** | Next.js `notFound()` |
| **Network error** | Error boundary + retry |
| **Normal** | Full detail page |

#### Component Tree

```
TokenDetailPage
├── TokenHeader                    ← Name / Symbol / Avatar / Copy Address
│   ├── TokenAvatar
│   ├── CopyAddress
│   ├── TokenSocialLinks           ← Twitter / Telegram / Website
│   └── VerifiedContractLink       ← Link to block explorer verified contract
│
├── GraduatedBanner               ← Only shown when selfDeprecated
│
├── ─────── Main Content (two-column) ───────
│
├── [Left Column] Chart + Stats
│   ├── BondingCurveProgress       ← 0% → 99% progress bar + milestone markers
│   │   └── Labels: current progress, graduation threshold 99%, K=21M
│   ├── PriceChart                 ← TradingView Lightweight Charts
│   │   ├── Time selection: 1m / 5m / 1h / 1d
│   │   └── Dual line: marginal price curve + actual avg trade price
│   ├── TokenStats                 ← On-chain statistics
│   │   ├── okbCum (Total OKB Invested)
│   │   ├── Minted (N / 21,000,000)
│   │   ├── Reserve OKB
│   │   └── Holders
│   └── CurveExplainCollapse       ← Collapsible curve mechanism explanation
│
├── [Right Column] Trade Panel
│   ├── TradePanel
│   │   ├── BuyForm / SellForm tab switch
│   │   ├── FeeTooltip             ← "0.3% fee goes to team multisig"
│   │   ├── PriceImpactBadge        ← >5% orange / >15% red
│   │   └── Limit notice (Buy ≤ 10 OKB)
│   │
│   └── [Graduated state] Buy disabled + "Minting has ended" notice
│
└── TransactionHistory             ← Transaction event stream
    └── TransactionRow[]
        ├── Timestamp
        ├── Type icon (Buy/Sell)
        ├── OKB amount
        ├── Token amount
        ├── Trader address (truncated)
        └── TX Hash link
```

#### Key Component Behaviors

##### BondingCurveProgress
- **Data**: Real-time read `okbCum` → compute `totalMinted / K * 100`
- **Milestone markers**: 25% / 50% / 75% / 90% / 99% (graduation)
- **Color scheme** (see Section 4.2 Bonding Curve Progress Gradient):
  - 0–50%: Blue gradient (#3B82F6 → #2563EB)
  - 50–75%: Purple gradient (#8B5CF6 → #7C3AED)
  - 75–90%: Orange gradient (#F59E0B → #D97706)
  - 90–99%: Red gradient (#EF4444 → #DC2626)
  - 99%+: Green solid (#22C55E) + "🎓 Graduated" label
- **Animation**: `transition-[width] duration-700 ease-out` on fill change
- **Tooltip**: Hover shows exact percentage + minted amount

##### TokenStats
- **Visual style**: 4 stat cards in a `grid grid-cols-2 lg:grid-cols-4 gap-3` layout. Each stat: `bg-surface border border-default rounded-card p-3` with label in `text-tertiary text-xs` and value in `text-primary font-mono font-medium`.
- **Stat fields**:
  - okbCum (Total OKB Invested)
  - Minted (N / 21,000,000)
  - Reserve OKB
  - Holders count

##### PriceChart
- **Library**: TradingView Lightweight Charts
- **Time ranges**: 1m / 5m / 1h / 1d (Line or Candlestick)
- **Dual line**:
  - Blue solid = Marginal price `marginalPrice(okbCum)` (real-time)
  - Gray dashed = Actual average trade price (subgraph aggregation)
- **Data sources**:
  - Marginal price: On-chain read per block
  - Average price: Subgraph time-bucket aggregation of Mint/Burn events
- **Interaction**: Hover shows exact OKB price value

##### BuyForm
- **Visual style**: Input field uses `bg-base rounded-input border border-default focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary`. CTA button: full-width `bg-accent-primary hover:brightness-110 h-12 rounded-input font-semibold`.
- **Input**: OKB amount (float input)
- **Validation**:
  - Max 10 OKB (contract per-tx limit)
  - Balance check
  - Not graduated
- **Real-time preview**:
  - `quoteMint(okbAmount)` → expected tokens received
  - Actual amount after 0.3% fee deduction
  - Price Impact percentage
- **Button text**: "Buy [Symbol]"
- **Call**: `wagmi useWriteContract` → `mint(okbAmount)`

##### SellForm
- **Input**: Token amount (or percentage shortcuts: 25% / 50% / 75% / MAX)
- **Validation**:
  - Balance check
  - Non-zero
- **Real-time preview**:
  - `quoteBurn(tokenAmount)` → expected OKB received
  - Actual amount after 0.3% fee deduction
  - Price Impact percentage
- **Button text**: "Sell [Symbol]"
- **Call**: `wagmi useWriteContract` → `burn(tokenAmount)`

##### TransactionHistory
- **Visual style**: `bg-surface border border-default rounded-card p-4`. Each row has `border-b border-default` (last row no border). New transactions slide in from top.
- **Data source**: WebSocket event stream (Mint / Burn events) + subgraph history query
- **Display**: Reverse chronological, auto-append new events (virtual scroll for large lists)
- **TransactionRow** fields:
  - Time (relative, e.g. "2 min ago", hover for exact time)
  - Type: Green ↑ Buy / Red ↓ Sell
  - Trader: Truncated address + external link to block explorer
  - Amount: OKB amount + token amount
  - TX Hash: Truncated + copyable block explorer link

##### FeeTooltip
- **Visual style**: Info icon (Lucide `Info`, 14×14) with `text-tertiary hover:text-secondary cursor-help`. Tooltip popup: `bg-elevated border border-default rounded-card shadow-lg p-3 text-xs` with `text-secondary`.
- **Trigger**: Hover fee number in buy/sell preview panel
- **Content**: "A 0.3% fee is charged on this transaction. 100% goes to the team multisig wallet."
- **Shows multisig address** (copyable)

##### PriceImpactBadge
- **Visual style**: Pill badge (`rounded-pill px-2 py-0.5 text-xs font-medium`). Hidden when <5%. Orange `bg-accent-warning/20 text-accent-warning` for 5-15%. Red `bg-accent-danger/20 text-accent-danger` for >15%.
- **Calculation**: `| newPrice - currentPrice | / currentPrice * 100`
- **Thresholds**:
  - < 5%: Hidden
  - 5–15%: Orange warning badge
  - \> 15%: Red danger badge + secondary confirmation prompt

---

### 5.3 Create Token Page `/create`

**Route**: `/create`

#### Flow Design

```
Step 1 ──→ Step 2 ──→ Step 3 ──→ Step 4
Basic Info  Socials    Curve Preview  Deploy
```

#### Page States

| State | Component Behavior |
|-------|-------------------|
| **Wallet not connected** | "Connect your wallet to continue" + connect button (guide) |
| **Normal** | Stepped form |
| **Deploying** | Step 4 shows transaction pending animation + TX Hash |
| **Deploy success** | Redirect to `/token/:newAddress` |
| **Deploy failed** | Error message + retry |
| **Validation failed** | Inline error messages |

#### Component Tree

```
CreatePage
└── CreateStepper           ← Step indicator (1-2-3-4)
    ├── StepBasicInfo       ← Step 1
    ├── StepSocialInfo      ← Step 2
    ├── StepCurvePreview    ← Step 3
    └── StepDeploy          ← Step 4
```

#### Step Details

##### CreateStepper
- **UI**: Top step bar, current step highlighted, completed steps show ✓
- **Logic**: Controls forward/back navigation, form data saved to localStorage to prevent loss

##### Step 1 — StepBasicInfo
| Field | Component | Validation |
|-------|-----------|------------|
| Token Name | `<input>` | Required, 1–32 chars, no whitespace-only |
| Token Symbol | `<input>` | Required, 1–8 chars, `onChange` auto-uppercase, A-Z only |
| Description | `<textarea>` | Required, max 280 chars, show remaining character count |
| Image Upload | Drag/click upload + crop | PNG/JPG, max 2MB, auto-compress to 512×512, upload to IPFS |

- **State**: All fields filled + valid → enable "Next" button
- **IPFS upload**: Use Pinata / web3.storage client to upload image, return IPFS URI
- **Client-side crop**: Use `react-image-crop` or `browser-image-compression`

##### Step 2 — StepSocialInfo
| Field | Component | Validation |
|-------|-----------|------------|
| Twitter/X Link | `<input>` | Optional, URL format validation |
| Telegram Link | `<input>` | Optional, URL format validation |
| Website Link | `<input>` | Optional, URL format validation |

- All fields optional, can skip directly

##### Step 3 — StepCurvePreview
- **Display fixed curve parameters** (immutable):
  | Parameter | Value |
  |-----------|-------|
  | K (Max Supply) | 21,000,000 |
  | S (Curve Shape) | 100 OKB |
  | Fee | 0.3% buy/sell |
- **Key price preview table**:
  | OKB Invested | Marginal Price (OKB) | Minted |
  |-------------|----------------------|--------|
  | 0 | 0.00001 | 0 |
  | 10 | ~0.000027 | ~2,000,000 |
  | 50 | ~0.000165 | ~8,250,000 |
  | 100 | ~0.000272 | ~13,260,000 |
  | ~105 | ~Graduation threshold | ~20,790,000 |
- **Small curve chart**: Show `marginalPrice(x)` shape from 0 → 110
- **CurveExplainCollapse**: Collapsible curve mechanism explanation

##### Step 4 — StepDeploy
- **Confirmation summary**:
  - Token name / symbol / description / avatar preview
  - Social links (if any)
  - Curve parameter confirmation (fixed, no user choice needed)
  - Gas fee estimate
- **Deploy button**: "Deploy [Symbol]"
- **Deploy flow**:
  1. Assemble metadata JSON (name, symbol, description, image IPFS URI, social links)
  2. Upload metadata JSON → IPFS → obtain `tokenURI`
  3. Call `Deployer.deploy(tokenURI)` contract method
  4. Wait for tx confirmation → parse new contract address from event logs
  5. Redirect to `/token/:newAddress`
- **States**:
  - Awaiting wallet confirmation
  - Transaction pending (show TX Hash + block explorer link)
  - Transaction confirmed (success animation + auto-redirect)
  - Transaction failed (error message + retry button)

---

### 5.4 Portfolio Page `/portfolio`

**Route**: `/portfolio`

#### Page States

| State | Component Behavior |
|-------|-------------------|
| **Wallet not connected** | Guide to connect wallet |
| **Loading** | Skeleton |
| **No holdings** | `EmptyState` ("No holdings yet. Explore tokens to get started!") |
| **Normal** | Full portfolio view |

#### Component Tree

```
PortfolioPage
├── PortfolioSummary             ← Overview cards
│   ├── Total Portfolio Value (OKB)
│   ├── Total Invested (OKB)
│   ├── Unrealized P&L (OKB + %)
│   └── Tokens Held
│
├── HoldingsList                 ← Holdings list
│   └── HoldingCard[]
│       ├── Token avatar + Name + Symbol
│       ├── Amount held
│       ├── Current value (OKB) = burnFor(totalMinted, holderShare)
│       ├── Average cost (OKB)
│       ├── Unrealized P&L (OKB + %)
│       └── Click → /token/:address
│
└── PortfolioHistory             ← Trade history
    └── TransactionRow[]         ← Reuses shared component
        ├── Time
        ├── Token
        ├── Type (Buy/Sell)
        ├── Amount
        └── TX Hash
```

#### Data Sources
- **Holdings list**: Subgraph → query all `Mint` events by user, dedupe `tokenAddress`, read `balanceOf` + `okbCum` per token to calculate value
- **Average cost**: Weighted average buy price (subgraph aggregates all Mint events for that token)
- **Trade history**: Subgraph → all Mint / Burn events for that address

---

## 6. Cross-page Shared Modules

### 6.1 Wallet Connection Module

- **Library**: RainbowKit (recommended, mature ecosystem)
- **Integration points**:
  - "Connect Wallet" button in `Header`
  - `/portfolio` unconnected guide
  - `/create` unconnected guide
  - `BuyForm` / `SellForm` pre-action check

### 6.2 Real-time Data Layer

| Data | Method | Refresh Rate |
|------|--------|-------------|
| `okbCum` (current OKB invested) | viem `publicClient.readContract` | Per block / 3s polling |
| Mint/Burn events | WebSocket `watchContractEvent` | Real-time push |
| Token metadata | IPFS `tokenURI` → JSON | Cache after first load |
| Token list / sorting | Subgraph query | 5s polling |
| Transaction history | Subgraph query + WS append | Hybrid |
| User holdings | Subgraph query | 10s polling |
| Price chart data | Subgraph aggregation | Per time range request |

### 6.3 Curve Calculation Module (`services/curve.ts`)

Pure TypeScript functions, no side effects, reusable:

```typescript
// Constants
const K = 21_000_000;
const S = 100; // OKB
const FEE_RATE = 0.003; // 0.3%

function marginalPrice(okbCum: number): number {}
function totalMinted(okbCum: number): number {}
function quoteMint(okbAmount: number): { tokens: number; fee: number; tokensAfterFee: number } {}
function quoteBurn(tokenAmount: number, okbCum: number): { okb: number; fee: number; okbAfterFee: number } {}
function priceImpact(okbAmount: number, okbCum: number): number {}
function isGraduated(okbCum: number): boolean {}
```

---

## 7. Shared Component Catalog

| Component | Purpose | Appears In |
|-----------|---------|------------|
| **CopyAddress** | Click to copy address, shows ✓ after copied | TokenHeader |
| **PriceImpactBadge** | >5% orange / >15% red badge | BuyForm, SellForm |
| **FeeTooltip** | Hover shows fee explanation + multisig address | BuyForm, SellForm |
| **CurveExplainCollapse** | Collapsible panel explaining sat1 curve mechanics | Step3, TokenDetail |
| **WelcomeModal** | First visit modal: "SATPAD vs Regular Meme Launchpad" | Any page (first visit) |
| **TokenAvatar** | Circle avatar + on-chain image or default fallback | TokenCard, TokenHeader, HoldingCard |
| **AddressDisplay** | Truncated address → `0x1234...abcd` + optional CopyAddress | Multiple places |
| **CountdownTimer** | Countdown timer component | When timing needed |
| **Skeleton** | Generic skeleton placeholder | All loading states |
| **ErrorBoundary** | React Error Boundary | Page-level wrapper |
| **EmptyState** | Empty data illustration + text + CTA | Explore, Portfolio |
| **VerifiedContractLink** | Block explorer verified contract link | TokenHeader |

---

## 8. State Management

### 8.1 Zustand Stores

| Store | Manages |
|-------|---------|
| `useWalletStore` | Wallet connection state, current address, chain ID |
| `useExploreStore` | Current tab, search keyword, token list, sort mode |
| `useTokenStore` | Current token's okbCum, tx history, chart data |

### 8.2 Data Flow

```
User operates TradePanel (BuyForm)
  ↓ wagmi useWriteContract
On-chain tx confirmed
  ↓ watchContractEvent (Mint event)
Update useTokenStore (okbCum, txHistory)
  ↓
PriceChart / BondingCurveProgress / TokenStats auto re-render
  ↓
Explore TokenCard senses update via subgraph polling
```

---

## 9. Routing Design

```
/                      → ExplorePage (SSG/ISR + client data)
/token/[address]       → TokenDetailPage (SSR shell + client data)
/create                → CreatePage (CSR, requires wallet)
/portfolio             → PortfolioPage (CSR, requires wallet)
```

- **`/` and `/token/[address]`**: Can use SSR for static SEO metadata (title, description), client-side for on-chain data
- **`/create` and `/portfolio`**: Pure CSR, wallet-dependent

### Metadata / SEO

| Page | Title | Description |
|------|-------|-------------|
| `/` | SATPAD — Permissionless Token Launchpad on XLayer | Decentralized Meme Launchpad powered by sat1 Bonding Curve |
| `/token/[address]` | [Symbol] — SATPAD | Dynamic: {name} ({symbol}) current price {price} OKB |
| `/create` | Create Token — SATPAD | Deploy your ERC-20 Meme token in one click |
| `/portfolio` | My Portfolio — SATPAD | View your token portfolio |

---

## 10. Key Interaction Flows

### 10.1 Buy Flow

```
1. User enters OKB amount in BuyForm
2. Real-time calculation → show estimated tokens + fee + Price Impact
3. User clicks "Buy"
4. Checks:
   - Wallet connected? → No → show connect modal
   - Sufficient balance? → No → show "Insufficient balance"
   - Amount ≤ 10 OKB? → No → disable button + red text hint
   - Graduated state? → Yes → disable button + "Minting has ended"
5. Call contract mint()
6. Wait for confirmation
7. On success: clear input + toast notification + refresh on-chain data
```

### 10.2 Sell Flow

```
1. User enters token amount in SellForm (or clicks 25%/50%/75%/MAX)
2. Real-time calculation → show estimated OKB + fee + Price Impact
3. User clicks "Sell"
4. Checks:
   - Wallet connected? → No → show connect modal
   - Sufficient token balance? → No → disable button
   - Same-block buy? → Contract-level revert, no special UI handling
5. Call contract burn()
6. Wait for confirmation
7. On success: clear input + toast notification + refresh on-chain data
```

### 10.3 Graduated State Interaction

```
selfDeprecated triggered:
├── BuyForm → Fully disabled, replaced by GraduatedBanner
├── SellForm → Still available (holders can still sell via hook)
├── BondingCurveProgress → Green 100% + graduation icon
├── TokenCard (Explore) → "Graduated" badge
└── Chart → Continue tracking secondary market price (if available)
```

---

## 11. Error & Edge Case Handling

| Scenario | Handling |
|----------|----------|
| Invalid contract address (not a SATPAD token) | TokenDetail shows "Invalid token", no crash |
| RPC unavailable | Error toast + fallback to backup RPC |
| Transaction rejected by user | Toast "Transaction cancelled" |
| Transaction revert | Parse revert reason, display user-friendly message |
| IPFS upload failed | Toast + allow retry |
| Subgraph query failed | Degrade to pure on-chain reads, limited display but page functional |
| Wrong network (not XLayer) | Header shows network error + switch network button |
| Image load failed | Show default placeholder |
| TokenURI parse failed | Show on-chain raw data, name displays "Unknown" |

---

## 12. Responsive Design Strategy

> See Section 4.9 for the full breakpoint table. This section describes page-specific responsive behaviors.

| Breakpoint | Layout Behavior |
|------------|-----------------|
| **≥ 1280px (xl)** | Full two-column layout (Token Detail), 4-column token grid (Explore) |
| **≥ 1024px (lg)** | Two-column layout (Token Detail), 3-column token grid |
| **768–1023px (md)** | Single column, 3-column token grid, panel on top |
| **640–767px (sm)** | Single column, 2-column token grid, condensed cards |
| **< 640px (mobile)** | Single column, full-width cards, sticky bottom CTA for TradePanel, horizontal scroll tabs |

### Page-Specific Adaptations

| Page | Mobile Adaptation |
|------|------------------|
| **Explore** | TokenCards: single column, hide 24h volume on smallest screens. Tabs: horizontal scroll. SearchBar: full-width above grid. |
| **Token Detail** | Two-column collapses to single: BondingCurveProgress + TokenStats on top, TradePanel below, TransactionHistory at bottom. TradePanel becomes sticky at bottom. |
| **Create** | Stepper: compact horizontal bar (hide labels, show step numbers only). Form fields: full-width. |
| **Portfolio** | Summary cards: 2-column grid → single-column stack. HoldingCard: condensed layout, hide average cost. |

### Mobile TradePanel (Sticky Bottom)

```
┌──────────────────────────────────────┐
│  [ Buy / Sell ] [ OKB input ] [ CTA ]│  ← Sticky bar, h-14
└──────────────────────────────────────┘
```

- Expandable: tap to open full TradePanel as bottom sheet
- Quick-buy: enter amount + wallet confirm in 2 taps
- Background: `bg-surface border-t border-default`

---

## 13. Tech Dependencies

| Category | Dependency |
|----------|------------|
| Framework | next 14, react 18, typescript |
| Chain | viem, wagmi v2 |
| Wallet | @rainbow-me/rainbowkit |
| State | zustand |
| Charts | lightweight-charts (TradingView) |
| Styling | Tailwind CSS |
| Forms | react-hook-form + zod |
| Images | browser-image-compression, pinata/web3.storage SDK |
| Notifications | sonner (or react-hot-toast) |
| Dates | date-fns |
| i18n | next-intl |

---

## 14. i18n Strategy (Phase 1 — English Only with Full Infra)

### Approach

Set up the `next-intl` infrastructure in Phase 1 with English as the only locale. All UI strings live in `src/lib/locales/en.json` and are consumed via `useTranslations()` / `t()` from day one. This avoids a costly migration later — adding a new language is simply adding a new JSON file.

### Directory

```
src/lib/
├── i18n.ts              # next-intl config (defaultLocale: 'en', locales: ['en'])
└── locales/
    └── en.json          # English (default)
```

### Setup

1. **`src/lib/i18n.ts`** — next-intl request config:
   ```typescript
   import { getRequestConfig } from 'next-intl/server';

   export default getRequestConfig(async () => ({
     locale: 'en',
     messages: (await import('./locales/en.json')).default,
   }));
   ```

2. **Root layout** — wrap with `NextIntlClientProvider`:
   ```tsx
   import { NextIntlClientProvider } from 'next-intl';
   ```

3. **`src/lib/locales/en.json`** — structured keys with template interpolation:
   ```json
   {
     "nav": {
       "explore": "Explore",
       "create": "Create",
       "portfolio": "Portfolio"
     },
     "buy": {
       "button": "Buy {symbol}",
       "maxHint": "Max 10 OKB per transaction"
     },
     "sell": {
       "button": "Sell {symbol}"
     },
     "error": {
       "insufficientBalance": "Insufficient balance",
       "invalidToken": "This address is not a valid SATPAD token",
       "txCancelled": "Transaction cancelled",
       "txFailed": "Transaction failed",
       "networkError": "Network error — please switch to XLayer"
     },
     "state": {
       "loading": "Loading...",
       "mintingEnded": "Minting has ended",
       "graduated": "Graduated",
       "noTokens": "No tokens yet. Be the first to create one!",
       "noHoldings": "No holdings yet. Explore tokens to get started!",
       "connectWallet": "Connect your wallet to continue"
     },
     "tooltip": {
       "fee": "A {rate}% fee is charged on this transaction. 100% goes to the team multisig wallet."
     },
     "label": {
       "tokenName": "Token Name",
       "symbol": "Symbol",
       "description": "Description",
       "priceImpact": "Price Impact"
     }
   }
   ```

### Key Principles

- **No string concatenation** — always use template interpolation (`{symbol}`, `{rate}`)
- **Structured keys** — grouped by domain (nav, buy, sell, error, state, tooltip, label…)
- **RTL-ready** — layout direction via CSS logical properties, trivially switchable
- **Number/date formatting** — use `Intl.NumberFormat` / `Intl.DateTimeFormat` from day one
- **Single source of truth** — all user-facing strings in `en.json`, never hardcoded

### Adding a Language Later

1. Add `zh.json` (or any language) under `src/lib/locales/`
2. Update `i18n.ts` locale list
3. Wire up locale detection (middleware / cookie / URL prefix) — zero component refactoring needed

---

## 15. Phase Plan Mapping

### Phase 1 — MVP

| Module | Content |
|--------|---------|
| **i18n** | next-intl setup + `en.json` with all UI strings |
| **Layout** | Header + Footer + Wallet Connect |
| **Explore** | TokenGrid + TokenCard + ExploreTabs + SearchBar (static + on-chain data, new tab only) |
| **Token Detail** | TokenHeader + BondingCurveProgress + TradePanel(Buy/Sell) + TokenStats + TransactionHistory (event stream) |
| **Create** | Full 4-step flow + deploy |

### Phase 2 — Polish

| Module | Content |
|--------|---------|
| Explore | trending / graduating tabs + subgraph aggregated data |
| Token Detail | PriceChart (TradingView) + real-time chart |
| Portfolio | Full portfolio page |
| Shared | WelcomeModal + CurveExplainCollapse + mobile optimization |

---

## 16. Appendix — Component Dependency Matrix

```
Header          ← walletStore
ExplorePage     ← exploreStore + subgraph queries
TokenCard       ← curve.ts (marginalPrice) + subgraph
TokenDetailPage ← tokenStore + subgraph + WS events
TradePanel      ← curve.ts (quoteMint/Burn) + walletStore
PriceChart      ← curve.ts + subgraph aggregated prices
CreatePage      ← walletStore + IPFS upload + contract deploy
PortfolioPage   ← walletStore + subgraph user queries
```

---

> **Document Version**: v1.2
> **Last Updated**: 2026-05-12
> **Status**: Under Review
> **Language**: English-only (i18n-ready)
> **UI Reference**: four.meme (dark theme, card-based layout)
