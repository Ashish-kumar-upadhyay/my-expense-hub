# Financial Serenity — Mobile-First Expense Tracker

An editorial-styled, mobile-first React expense tracker built per the frontend
assignment spec. Four screens (Dashboard, Transactions, Add, Analytics), full
CRUD, localStorage persistence, donut + 6-month trend charts, and category
filtering.

## Setup

```bash
bun install
bun run dev
```

Open the preview. Data persists to `localStorage` under `fs.transactions.v1`.
Clear that key to reset to seed data.

## Tech

- **Framework:** React 19 on TanStack Start (Vite). File-based routing.
- **Styling:** Plain CSS (`src/styles/app.css`). No Tailwind classes, no UI library.
- **State:** React Context + `useState` / `useMemo` (`src/lib/transactions.tsx`).
- **Charts:** Recharts (donut + 6-month bar).
- **Icons:** lucide-react (already in template).
- **Persistence:** `localStorage`, hydrated on mount, written on every change.

## Key decisions

- **Plain CSS, mobile-first frame.** The app is centered in a 480px (640px on
  desktop) frame to mimic the supplied design at 375px base width while still
  being usable on larger screens.
- **Single Context store.** All transactions, totals, and CRUD live in
  `TransactionsProvider`. Totals derive from state via `useMemo` so balance,
  income, and expense update in real-time.
- **Date grouping.** `groupByDate` produces Today / Yesterday / formatted labels.
- **Edit via route search params.** `Add` screen reads `?id=` and switches into
  edit mode, reusing the same form for both add and update.
- **Seed data.** On first load the store seeds a handful of sample transactions
  so the dashboard, list, and analytics screens aren't empty.

## What I'd improve with more time

- Swipe-to-delete / long-press menu on transaction rows instead of tap-to-expand.
- Drag-able amount keypad and proper currency formatting on input.
- Per-category color picker and ability to define custom categories.
- Export / import CSV.
- Tests (Vitest + React Testing Library) for the context reducer and
  `groupByDate` / analytics aggregations.
- Page-transition animations via `framer-motion` (currently just a CSS fade).