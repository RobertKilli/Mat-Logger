---
id: '3.4'
title: 'Treningshistorikk'
epicId: '3'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: Treningshistorikk

**As a** User,
**I want to** view a list of my previous workouts,
**So that** I can track my consistency and monitor my intensity trends over time.

## Acceptance Criteria

### AC3.4.1: History View [x]
**Given** multiple past workout entries in the database
**When** I navigate to the history page (`/history`)
**Then** I see a chronological list of all my recorded sessions
**And** the most recent session appears at the top

### AC3.4.2: High-Density Session Cards [x]
**Given** an entry in the history list
**Then** I see the following details:
  - Workout Category (PUSH / PULL / LEGS)
  - Date and Time of the session
  - Duration (min)
  - Intensity Rating (1-10) with visual color indicator matching the CNS model

### AC3.4.3: Navigation [x]
**Given** the dashboard or any other main page
**When** I look at the navigation menu
**Then** I see a clear link to the "History" section

## Tasks / Subtasks

- [x] Task 1: Create History Service (AC: 3.4.1)
  - [x] Implement `getWorkoutHistory` in `src/app/(dashboard)/history/actions.ts`
  - [x] Ensure logs are ordered by `logged_at` descending
- [x] Task 2: Build History UI (AC: 3.4.1, 3.4.2)
  - [x] Create `src/components/dashboard/WorkoutHistory.tsx` using Technical Data Cards
  - [x] Map the intensity value to the CNS color scheme (Green/Yellow/Red)
- [x] Task 3: History Route (AC: 3.4.1)
  - [x] Create `src/app/(dashboard)/history/page.tsx`
- [x] Task 4: Navigation Update (AC: 3.4.3)
  - [x] Add the "History" link to the dashboard's quick actions or a global navigation component
- [x] Task 5: Validation
  - [x] Verify that empty states are handled gracefully if no workouts are recorded
  - [x] Verify that timestamps are correctly converted to user-local time

## Dev Notes

### Technical Guardrails
- **Styling:** Monospace fonts for metrics ensure visual stability.
- **Accessibility:** High-contrast indicators for intensity levels.
- **Navigation:** Deep integration into the Pilot Dashboard.

### Project Structure Alignment
- `src/app/(dashboard)/history/` for route management.
- `src/components/dashboard/WorkoutHistory.tsx` for shared list visualization.

### References
- [Source: docs/planning-artifacts/prd.md#FR15]
- [Source: docs/planning-artifacts/ux-design-specification.md#Button Hierarchy]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Create the server-side fetcher for workout logs.
2. Design the chronological list component.
3. Implement the history page with responsive layout.
4. Integrate the history link into the dashboard navigation.

### File List
- `src/app/(dashboard)/history/page.tsx` (NEW)
- `src/app/(dashboard)/history/actions.ts` (NEW)
- `src/components/dashboard/WorkoutHistory.tsx` (NEW)
- `src/app/page.tsx` (MODIFIED)

## Story Completion Status
- **Status:** done
- **Completion Note:** Training history fully implemented with chronological logs and CNS-aligned intensity indicators. Lint passing.
