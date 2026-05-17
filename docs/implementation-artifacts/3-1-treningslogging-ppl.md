---
id: '3.1'
title: 'Treningslogging (PPL)'
epicId: '3'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: Treningslogging (PPL)

**As a** User,
**I want to** log my Push, Pull, or Legs workout with its duration and intensity,
**So that** the system can track my neurological and metabolic load.

## Acceptance Criteria

### AC3.1.1: Workout Entry UI [x]
**Given** the training log page
**When** I view the entry form
**Then** I can select a category from "Push", "Pull", or "Legs"
**And** I can enter duration in minutes and intensity on a scale of 1-10

### AC3.1.2: Numeric Input Guardrails [x]
**Given** duration and intensity fields
**When** I enter values
**Then** duration must be > 0
**And** intensity must be an integer between 1 and 10
**And** the "Record Session" button is only enabled for valid inputs

### AC3.1.3: Database Persistence [x]
**Given** a valid workout entry
**When** I click "Record Session"
**Then** a record is created in the `workout_logs` table via Prisma
**And** it includes the `user_id`, `category`, `duration_minutes`, `intensity`, and the current `model_version_id`

### AC3.1.4: Immediate Confirmation [x]
**Given** a saved workout log
**Then** I am redirected to the dashboard (Cockpit)
**And** a success notification (Haptic/Visual) is triggered

## Tasks / Subtasks

- [x] Task 1: Update Prisma Schema (AC: 3.1.3)
  - [x] Add `TrainingCategory` enum (PUSH, PULL, LEGS)
  - [x] Add `WorkoutLog` model (user_id, category, duration_minutes, intensity, model_version_id, logged_at)
  - [x] Define relations (User -> WorkoutLog, ModelVersion -> WorkoutLog)
- [x] Task 2: Build WorkoutEntry Component (AC: 3.1.1, 3.1.2)
  - [x] Create `src/components/forms/WorkoutEntryForm.tsx` using "Midnight Engine" styling
  - [x] Implement a custom slider or step-input for Intensity (1-10)
- [x] Task 3: Implement Workout Action (AC: 3.1.3, 3.1.4)
  - [x] Create `src/app/(dashboard)/training/actions.ts` to save the workout log
  - [x] Ensure `model_version_id` is retrieved via `MetabolicMotor.getContext()`
- [x] Task 4: Training Route
  - [x] Create `src/app/(dashboard)/training/page.tsx`
- [x] Task 5: Validation
  - [x] Verify that intensity values outside 1-10 are rejected by the server action
  - [x] Verify that the log correctly stores the PPL category

## Dev Notes

### Technical Guardrails
- **Data Integrity:** Accurate intensity inputs are key for Epic 3.3 (CNS Fatigue).
- **Styling:** "Midnight Engine" aesthetics with neon green accents.
- **Workflow:** Redirect to dashboard after logging for immediate feedback.

### Project Structure Alignment
- `src/app/(dashboard)/training/` for workout entry routes.
- `src/components/forms/WorkoutEntryForm.tsx` for the shared form component.

### References
- [Source: docs/planning-artifacts/prd.md#FR13, FR14]
- [Source: docs/planning-artifacts/architecture.md#Novel Patterns - CNS Fatigue Indicator]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Extend Prisma schema with workout models and enums.
2. Build the training entry UI with PPL selection.
3. Implement the Server Action for database persistence.
4. Hook up the redirection and success feedback.

### File List
- `prisma/schema.prisma` (MODIFIED)
- `src/app/(dashboard)/training/page.tsx` (NEW)
- `src/app/(dashboard)/training/actions.ts` (NEW)
- `src/components/forms/WorkoutEntryForm.tsx` (NEW)

## Story Completion Status
- **Status:** done
- **Completion Note:** PPL workout logging implemented with intensity and duration tracking. Prisma schema updated and lint passing.
