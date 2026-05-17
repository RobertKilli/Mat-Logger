---
id: '3.2'
title: 'Glycogen Debt Clock'
epicId: '3'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: Glycogen Debt Clock

**As a** User,
**I want to** see my current glycogen status as a visual clock/gauge,
**So that** I can optimize my carbohydrate timing for training performance.

## Acceptance Criteria

### AC3.2.1: Metabolic Calculation [x]
**Given** my carb intake history and body weight
**When** the system calculates glycogen status
**Then** it applies the formula for depletion based on time and basal metabolic rate
**And** increases levels based on logged carbohydrate entries

### AC3.2.2: Visual "Cockpit" Gauge [x]
**Given** a glycogen percentage (0-100%)
**When** I view the dashboard
**Then** I see a circular "Metabolic Ring" component
**And** the color shifts based on level:
  - Green (> 70%): Saturated
  - Orange (30-70%): Depleting
  - Red (< 30%): Debt/Low

### AC3.2.3: Zero-Lag Updates [x]
**Given** the dashboard is open
**When** a new food log with carbs is saved
**Then** the Glycogen Clock updates its visual state immediately (< 200ms)

## Tasks / Subtasks

- [x] Task 1: Implement Glycogen Logic (AC: 3.2.1)
  - [x] Create `src/lib/metabolism/glycogen.ts`
  - [x] Implement `calculateGlycogenState` (Weight, Time since last log, Consumed Carbs)
- [x] Task 2: Extend Cockpit Store (AC: 3.2.3)
  - [x] Update `src/store/cockpitStore.ts` to include `calculateCurrentGlycogen` action
- [x] Task 3: Build GlycogenClock Component (AC: 3.2.2)
  - [x] Create `src/components/dashboard/GlycogenClock.tsx` as an SVG circular gauge
  - [x] Implement color-shift logic based on percentage
- [x] Task 4: Dashboard Integration
  - [x] Replace the mock glycogen indicator in `src/app/page.tsx` with the real component
- [x] Task 5: Validation
  - [x] Verify that 0g carb intake over 24h results in significant depletion
  - [x] Verify that logging 100g carbs causes an immediate visual jump in the gauge

## Dev Notes

### Technical Guardrails
- **Formula:** Uses `0.1g/kg/hr` basal depletion and `5g/kg` max capacity.
- **Visuals:** SVG-based ring with CSS transitions for smooth animations.
- **Store:** State is re-calculated whenever baseline or daily totals change.

### Project Structure Alignment
- `src/lib/metabolism/glycogen.ts` for logic.
- `src/components/dashboard/GlycogenClock.tsx` for UI.

### References
- [Source: docs/planning-artifacts/prd.md#FR16]
- [Source: docs/planning-artifacts/architecture.md#Novel Patterns - Glycogen Debt Clock]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Research/Define the resting glycogen depletion formula.
2. Build the `glycogen.ts` utility.
3. Create the SVG `GlycogenClock` component with Tailwind.
4. Hook up the Zustand store to trigger re-calculations.

### File List
- `src/lib/metabolism/glycogen.ts` (NEW)
- `src/components/dashboard/GlycogenClock.tsx` (NEW)
- `src/store/cockpitStore.ts` (MODIFIED)
- `src/app/page.tsx` (MODIFIED)

## Story Completion Status
- **Status:** done
- **Completion Note:** Glycogen Debt Clock fully implemented. Cockpit now visualizes real-time carbohydrate saturation and depletion.
