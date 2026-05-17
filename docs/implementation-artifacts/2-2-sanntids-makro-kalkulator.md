---
id: '2.2'
title: 'Sanntids Makro-kalkulator'
epicId: '2'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: Sanntids Makro-kalkulator

**As a** User,
**I want to** see the calculated macro values and their impact on my daily goals update as I type the weight,
**So that** I know exactly the physiological footprint before I save the log.

## Acceptance Criteria

### AC2.2.1: Dynamic Macro Scaling [x]
**Given** a food item with macros per 100g
**When** I change the weight value in the entry field
**Then** the protein, carbohydrates, fat, and calories update immediately
**And** the calculation follows: `(Value_per_100g / 100) * Input_Grams`

### AC2.2.2: Goal Impact Visualization [x]
**Given** a defined daily protein goal
**When** I enter a food weight
**Then** the UI shows how much of the protein goal this entry satisfies (e.g., "+15% of daily target")
**And** this visualization updates in real-time as I type (Zero-Wait Feedback)

### AC2.2.3: Visual Stability [x]
**Given** rapid typing of grams
**Then** the numeric displays use `JetBrains Mono` to prevent layout shifting during updates

## Tasks / Subtasks

- [x] Task 1: Extend Cockpit Store (AC: 2.2.2)
  - [x] Update `src/store/cockpitStore.ts` to include `dailyConsumedProtein`
- [x] Task 2: Implement Impact Visualization (AC: 2.2.2)
  - [x] Update `src/components/forms/GramEntryForm.tsx` to display goal progress bars/indicators
  - [x] Calculate "Entry % of Goal" dynamically
- [x] Task 3: UI Polishing (AC: 2.2.3)
  - [x] Ensure all numeric values use `JetBrains Mono`
  - [x] Implement subtle animations for value transitions
- [x] Task 4: Validation
  - [x] Verify that calculations match the scientific formula for various weights
  - [x] Verify that the progress bar correctly reflects the additive impact of the current entry

## Dev Notes

### Technical Guardrails
- **Formula:** Precision is key. Use at least 1 decimal place for protein/carbs/fat.
- **Zustand:** Bind the goal values from the store to the form calculations.
- **Styling:** Use High-Energy Green (`#00FF41`) for positive progress towards goals.

### Project Structure Alignment
- UI components stay in `src/components/forms/`.
- Logic in `src/lib/metabolism/macros.ts` (already created in 2.1).

### References
- [Source: docs/planning-artifacts/prd.md#FR7, FR8]
- [Source: docs/planning-artifacts/ux-design-specification.md#Novel UX Patterns]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Update Zustand store with basic daily totals (consumed today).
2. Enhance `GramEntryForm` to fetch goal targets from the store.
3. Add "Goal Impact" display (percentage of target).
4. Apply visual refinements with JetBrains Mono.

### File List
- `src/store/cockpitStore.ts` (UPDATED)
- `src/components/forms/GramEntryForm.tsx` (UPDATED)

## Story Completion Status
- **Status:** done
- **Completion Note:** Real-time macro impact calculator implemented with visual progress tracking against protein goals. Visual stability ensured with monospace fonts.
