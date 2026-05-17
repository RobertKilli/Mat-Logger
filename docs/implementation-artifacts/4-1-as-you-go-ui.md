---
id: '4.1'
title: 'As-you-go UI'
epicId: '4'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: As-you-go UI

**As a** User,
**I want to** see the fysiologiske indikatorene update instantly as I input data in the forms,
**So that** I get immediate visual confirmation of the impact of my actions before I commit them.

## Acceptance Criteria

### AC4.1.1: Immediate Store Feedback [x]
**Given** an active food logging or workout entry form
**When** I change an input value (e.g., grams or intensity)
**Then** the `cockpitStore.ts` is updated with a "Preview" state immediately
**And** the dashboard components react to this state in < 200ms

### AC4.1.2: Preview Visualization [x]
**Given** a dashboard indicator (Glycogen Clock / CNS Meter)
**When** a preview value is active
**Then** the indicator shows the projected outcome with a visual distinction (e.g., 50% opacity or dashed lines)
**And** the numeric value shows the potential delta (e.g., "85% -> 92%")

### AC4.1.3: Commit/Reset Logic [x]
**Given** a preview state
**When** the form is submitted successfully
**Then** the preview state is merged into the permanent state
**When** the form is cancelled
**Then** the preview state is cleared and indicators return to their previous values

## Tasks / Subtasks

- [x] Task 1: Update Cockpit Store for Previews (AC: 4.1.1)
  - [x] Add `previewProtein`, `previewCarbs`, `previewIntensity` etc. to `src/store/cockpitStore.ts`
  - [x] Implement `setPreviewData` and `clearPreview` actions
- [x] Task 2: Enhance Indicater Components (AC: 4.1.2)
  - [x] Update `GlycogenClock.tsx` to visualize the projected delta
  - [x] Update `CNSMeter.tsx` to visualize the projected fatigue impact
- [x] Task 3: Form Binding (AC: 4.1.1, 4.1.3)
  - [x] Update `GramEntryForm.tsx` to call `setPreviewData` on setiap tastetrykk
  - [x] Update `WorkoutEntryForm.tsx` to call `setPreviewData` as intensity changes
- [x] Task 4: UI Polishing
  - [x] Add smooth transitions between current and preview states using Tailwind's `duration-500`
- [x] Task 5: Validation
  - [x] Verify that indicators update in real-time on mobile devices
  - [x] Verify that cancelling a form correctly resets the cockpit gauges

## Dev Notes

### Technical Guardrails
- **Sync:** Forms call `setPreview` in a `useEffect` based on local state changes.
- **Visuals:** Used a pulsing "Projected" ring layer with secondary text for deltas.
- **Store:** `setPreview` logic ensures immediate reactive updates on the dashboard.

### Project Structure Alignment
- Extended `cockpitStore.ts` with preview capabilities.
- Dashboard gauges now accept store-driven projections.

### References
- [Source: docs/planning-artifacts/prd.md#FR20]
- [Source: docs/planning-artifacts/ux-design-specification.md#Feedback Patterns]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Extend store with preview fields and a calculation trigger.
2. Modify gauges to render two layers: "Base" (solid) and "Projection" (translucent).
3. Connect form inputs to the preview actions.
4. Ensure the success path clears the preview and refreshes the base data.

### File List
- `src/store/cockpitStore.ts` (MODIFIED)
- `src/components/dashboard/GlycogenClock.tsx` (MODIFIED)
- `src/components/dashboard/CNSMeter.tsx` (MODIFIED)
- `src/components/forms/GramEntryForm.tsx` (MODIFIED)
- `src/components/forms/WorkoutEntryForm.tsx` (MODIFIED)

## Story Completion Status
- **Status:** done
- **Completion Note:** As-you-go UI pattern fully implemented. Cockpit gauges now project future physiological states in real-time during data entry.
