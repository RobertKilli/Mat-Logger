---
id: '3.3'
title: 'CNS Fatigue Indicator'
epicId: '3'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: CNS Fatigue Indicator

**As a** User,
**I want to** see a representation of my nervous system fatigue,
**So that** I know when to prioritize recovery over high-intensity training.

## Acceptance Criteria

### AC3.3.1: Fatigue Modeling [x]
**Given** my recent training logs (category, intensity, timestamp)
**When** the system calculates neurological readiness
**Then** it applies an exponential decay model where intensity adds to "fatigue debt"
**And** debt decreases naturally over time (restitution)

### AC3.3.2: Visual "Cockpit" Meter [x]
**Given** a CNS fatigue percentage (0-100%)
**When** I view the dashboard
**Then** I see a circular "Metabolic Ring" (CNS Fatigue Indicator)
**And** the state is represented by:
  - Green (< 30%): Optimal Readiness
  - Yellow (30-70%): Accumulated Fatigue
  - Red (> 70%): Systemic Overload

### AC3.3.3: Recovery Prediction [x]
**Given** a high fatigue state
**Then** the UI provides a predicted timeframe (hours/days) until the system returns to the "Optimal" zone

### AC3.3.4: Real-time Reaction [x]
**Given** the dashboard is open
**When** a new workout session is recorded
**Then** the CNS Fatigue Indicator updates its state immediately (< 200ms)

## Tasks / Subtasks

- [x] Task 1: Implement Recovery Logic (AC: 3.3.1)
  - [x] Create `src/lib/metabolism/recovery.ts`
  - [x] Implement `calculateCNSFatigue` (Base fatigue, Intensity, Hours since session)
- [x] Task 2: Extend Cockpit Store (AC: 3.3.4)
  - [x] Update `src/store/cockpitStore.ts` to include `calculateCurrentCNS` action
  - [x] Fetch recent workout logs for the calculation
- [x] Task 3: Build CNSMeter Component (AC: 3.3.2, 3.3.3)
  - [x] Create `src/components/dashboard/CNSMeter.tsx` using SVG
  - [x] Display the predicted recovery time (e.g., "Full recovery in 18h")
- [x] Task 4: Dashboard Integration
  - [x] Replace the mock CNS indicator in `src/app/page.tsx` with the real component
- [x] Task 5: Validation
  - [x] Verify that a 10/10 intensity session results in a "Red" status
  - [x] Verify that fatigue decreases predictably over 24-48 hours

## Dev Notes

### Technical Guardrails
- **Model:** Exponential decay with a 24-hour half-life for neurological restitution.
- **Visuals:** High-contrast ring with predictive labels.
- **Store:** Combined hydration for both baseline, macros, and workout history.

### Project Structure Alignment
- `src/lib/metabolism/recovery.ts` for recovery formulas.
- `src/components/dashboard/CNSMeter.tsx` for the visual widget.

### References
- [Source: docs/planning-artifacts/prd.md#FR17]
- [Source: docs/planning-artifacts/architecture.md#Novel Patterns - CNS Fatigue Indicator]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Establish the exponential decay formula for neurological restitution.
2. Build the `recovery.ts` utility.
3. Create the `CNSMeter` component with the predictive recovery label.
4. Hook up the Zustand store to aggregate workout logs and calculate state.

### File List
- `src/lib/metabolism/recovery.ts` (NEW)
- `src/components/dashboard/CNSMeter.tsx` (NEW)
- `src/store/cockpitStore.ts` (MODIFIED)
- `src/app/page.tsx` (MODIFIED)
- `src/components/dashboard/HydrateCockpit.tsx` (MODIFIED)

## Story Completion Status
- **Status:** done
- **Completion Note:** CNS Fatigue Indicator fully implemented. Pilot dashboard now predicts neurological readiness based on training history.
