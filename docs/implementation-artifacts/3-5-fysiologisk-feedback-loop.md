---
id: '3.5'
title: 'Fysiologisk Feedback-loop'
epicId: '3'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: Fysiologisk Feedback-loop

**As a** User,
**I want to** provide subjective feedback on my actual energy levels after a workout,
**So that** the "Metabolic Motor" can be calibrated to my unique physiology over time.

## Acceptance Criteria

### AC3.5.1: Feedback Trigger [x]
**Given** a recently completed workout log
**When** I view the session summary or dashbord
**Then** I am prompted to provide a "Subjective Readiness" score (1-10)
**And** I can optionally add a note on "Actual vs Predicted" feeling

### AC3.5.2: Comparative Logging [x]
**Given** a subjective score
**When** I submit the feedback
**Then** the system calculates the delta between its prediction (CNS Fatigue score at time of workout) and my actual feeling
**And** saves this relationship to the database for future calibration models

### AC3.5.3: Visual Confirmation [x]
**Given** a submitted feedback loop
**Then** I see a "Calibration Synchronized" confirmation
**And** the feedback is linked to the specific `workout_log_id`

## Tasks / Subtasks

- [x] Task 1: Update Prisma Schema (AC: 3.5.2)
  - [x] Add `subjective_fatigue` (Int) and `subjective_notes` (Text, nullable) to `WorkoutLog` model
  - [x] Add `predicted_fatigue_at_log` (Int) to store the app's state at the moment of the session
- [x] Task 2: Build Feedback Component (AC: 3.5.1, 3.5.3)
  - [x] Create `src/components/forms/FeedbackLoop.tsx`
  - [x] Implement a simple 1-10 rating scale (Technical Nudge style)
- [x] Task 3: Implement Feedback Action (AC: 3.5.2)
  - [x] Create `recordSubjectiveFeedback` Server Action in `src/app/(dashboard)/training/actions.ts`
- [x] Task 4: UI Integration
  - [x] Display the feedback prompt on the dashboard if a session was recently logged but not yet rated
- [x] Task 5: Validation
  - [x] Verify that submitting feedback updates the correct `WorkoutLog` record
  - [x] Verify that the predicted vs actual delta can be derived from the stored fields

## Dev Notes

### Technical Guardrails
- **Sync:** Feedback is linked to existing logs via UUID.
- **Model Integrity:** Capturing `predicted_fatigue_at_log` allows for retrospective model auditing.
- **Animation:** Dashboard prompt uses Tailwind animations for a non-intrusive appearance.

### Project Structure Alignment
- Feedback form in `src/components/forms/FeedbackLoop.tsx`.
- Extended training actions for log updates.

### References
- [Source: docs/planning-artifacts/prd.md#FR19]
- [Source: docs/planning-artifacts/ux-design-specification.md#Micro-Emotions]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Update schema to include subjective metrics.
2. Build the rating UI component.
3. Hook up the server action for updating existing logs.
4. Implement the "Prompt" logic on the dashboard.

### File List
- `prisma/schema.prisma` (MODIFIED)
- `src/components/forms/FeedbackLoop.tsx` (NEW)
- `src/app/(dashboard)/training/actions.ts` (MODIFIED)
- `src/app/page.tsx` (MODIFIED)

## Story Completion Status
- **Status:** done
- **Completion Note:** Fysiologisk feedback-loop implemented. Pilots can now calibrate the metabolic motor with subjective data.
