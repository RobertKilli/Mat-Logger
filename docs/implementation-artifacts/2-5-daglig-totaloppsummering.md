---
id: '2.5'
title: 'Daglig Totaloppsummering'
epicId: '2'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: Daglig Totaloppsummering

**As a** User,
**I want to** see my total protein, carb, fat, and calorie intake for the day,
**So that** I can monitor my progress against my baseline targets.

## Acceptance Criteria

### AC2.5.1: Real-time Dashboard Summary [x]
**Given** multiple food logs for the current day
**When** I view the dashboard (Body Cockpit)
**Then** I see the sum of all protein, carbohydrates, fat, and calories
**And** the display updates immediately when a new item is logged (optimistic update or store hydration)

### AC2.5.2: Target Comparison [x]
**Given** the daily totals and baseline targets
**Then** the UI shows a visual comparison (e.g., progress bars) for each macro
**And** protein progress is highlighted in High-Energy Green (`#00FF41`)

### AC2.5.3: Accurate "Today" Filtering [x]
**Given** food logs with UTC timestamps
**When** calculating the daily summary
**Then** the system filters logs based on the user's current local calendar day

## Tasks / Subtasks

- [x] Task 1: Update Cockpit Store (AC: 2.5.1)
  - [x] Add `dailyConsumedCarbs`, `dailyConsumedFat`, and `dailyConsumedCalories` to `src/store/cockpitStore.ts`
- [x] Task 2: Implement Summary Calculation Service (AC: 2.5.1, 2.5.3)
  - [x] Create `src/app/(dashboard)/actions.ts` with a `getDailyTotals` function
  - [x] Use `date-fns` to handle local-day filtering in Prisma queries
- [x] Task 3: Build DailySummary Component (AC: 2.5.2)
  - [x] Create `src/components/dashboard/DailySummary.tsx` using Technical Data Cards
  - [x] Implement progress bars for each macro target
- [x] Task 4: Dashboard Integration (AC: 2.5.1)
  - [x] Update the home page (`src/app/page.tsx`) to display the `DailySummary`
- [x] Task 5: Validation
  - [x] Verify that adding a log for "yesterday" does not affect "today's" totals
  - [x] Verify that totals match the sum of individual logs

## Dev Notes

### Technical Guardrails
- **Logic:** `date-fns` ensures accurate daily aggregation.
- **Hydration:** `HydrateCockpit` component bridges SSR data to Zustand.
- **UI:** Progress bars visualize the gap between consumption and targets.

### Project Structure Alignment
- `src/components/dashboard/` for all Cockpit widgets.
- Root `page.tsx` now functions as the Pilot Dashboard.

### References
- [Source: docs/planning-artifacts/prd.md#FR8]
- [Source: docs/planning-artifacts/architecture.md#Implementation Patterns]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Extend Zustand store to track all macros.
2. Build the server-side aggregator for today's logs.
3. Design the summary UI with progress indicators.
4. Hook up the initial hydration in the dashboard layout/page.

### File List
- `src/store/cockpitStore.ts` (MODIFIED)
- `src/app/(dashboard)/actions.ts` (NEW)
- `src/components/dashboard/DailySummary.tsx` (NEW)
- `src/components/dashboard/HydrateCockpit.tsx` (NEW)
- `src/app/page.tsx` (MODIFIED)

## Story Completion Status
- **Status:** done
- **Completion Note:** Daily nutritional summary implemented. Dashboard now shows real-time progress against pilot targets.
