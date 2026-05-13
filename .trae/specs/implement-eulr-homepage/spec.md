# Eulr Homepage UI Implementation Spec

## Why
The user wants to implement the homepage following the provided UI mockup ("eulr" branding, dark mode, neon green accents) and the prototype `Eulr-demo.html`. This involves a complete redesign of the hero section, the navigation, the stats display, the tab/filter section, and the token card grid to match the bold, modern, exponential launchpad aesthetic.

## What Changes
- **Header Refactor**: Change branding to "eulr BETA", update navigation links, and replace wallet connect with the network/balance dropdown + theme toggles shown in the mockup.
- **Hero Section Creation**: Add the bold "The exponential *launchpad*." headline, description text, and primary call-to-action buttons ("Launch a token", "Read the docs").
- **Stats Display**: Implement the four statistics cards (TOKENS LIVE, 24H VOLUME, GRADUATED, TOTAL TRADES).
- **Tabs & Search**: Redesign the filter tabs (Trending, New, Graduating soon, All) with icons and add a toggle (Comfy / Compact) alongside the search bar.
- **Token Cards Grid**: Update the `TokenGrid` and token cards to match the design (status badges, progress bars, price/mcap/vol metrics, and mini charts).
- **Aesthetics & Theme**: Apply dark mode colors (`#0A0B0E` background, `#00FF88` primary accent, `#F2F4F8` text), typography (Inter font), and layout spacing based on the provided prototype and skill guidelines.

## Impact
- Affected specs: UI/UX layout for the homepage.
- Affected code: `src/app/page.tsx`, `src/components/layout/Header.tsx`, `src/components/explore/TokenGrid.tsx`, `src/components/explore/ExploreTabs.tsx`, `tailwind.config.ts`, `src/app/globals.css`.

## ADDED Requirements
### Requirement: Exponential Launchpad Hero
The system SHALL display a hero section with the main headline, description, and action buttons.

### Requirement: Platform Statistics
The system SHALL display global platform statistics (Tokens Live, Volume, Graduated, Total Trades) below the hero text.

### Requirement: Token Filtering and Display
The system SHALL allow users to filter tokens by categories (Trending, New, Graduating soon, All) and view them in a responsive grid.

## MODIFIED Requirements
### Requirement: Header Navigation
The header MUST reflect the "eulr" branding and include user balance/wallet address instead of a generic "Connect Wallet" button.
