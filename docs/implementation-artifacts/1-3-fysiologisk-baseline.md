---
id: '1.3'
title: 'Fysiologisk Baseline'
epicId: '1'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: Fysiologisk Baseline

**As a** User,
**I want to** set my current body weight and a daily protein goal,
**So that** the app can personalize my targets and metabolic calculations.

## Acceptance Criteria

### AC1.3.1: Profile Settings UI [x]
**Given** a logged-in user on the profile/settings page
**When** I view the form
**Then** I see input fields for "Body Weight (kg)" and "Daily Protein Goal (g)"
**And** the fields are pre-filled with current values if they exist

### AC1.3.2: Data Persistence [x]
**Given** a user enters new values for weight and protein goal
**When** I submit the form
**Then** the values are validated (weight > 0, protein goal >= 0)
**And** saved to the `users` table in the database via Prisma
**And** a success notification is displayed

### AC1.3.3: Integration with Cockpit [x]
**Given** saved weight and protein goal
**When** I view the dashboard
**Then** the UI reflects these baseline values in its calculations (to be fully implemented in future epics, but the data must be available in the session/store)

## Tasks / Subtasks

- [x] Task 1: Create Profile UI (AC: 1.3.1)
  - [x] Create `src/app/(dashboard)/profile/page.tsx`
  - [x] Implement `ProfileForm` component in `src/components/forms/ProfileForm.tsx` using Tailwind CSS and "Midnight Engine" styling
- [x] Task 2: Implement Profile Actions (AC: 1.3.2)
  - [x] Create `src/app/(dashboard)/profile/actions.ts` for updating user metadata
  - [x] Add server-side validation for numeric inputs
- [x] Task 3: Store Integration (AC: 1.3.3)
  - [x] Update `cockpitStore.ts` to include `weight` and `proteinGoal`
  - [x] Fetch profile data on layout load and hydrate the store
- [x] Task 4: Validation & Testing
  - [x] Verify that saving non-numeric or negative values returns an error
  - [x] Verify successful save persists through page refresh

## Dev Notes

### Technical Guardrails
- **ORM:** Use Prisma 6 to update the `User` model.
- **Styling:** Use `JetBrains Mono` for numeric inputs and `Inter` for labels.
- **UX Pattern:** "Zero-Wait Feedback"—consider optimistic updates for the profile values.
- **Security:** Ensure the update action only affects the authenticated user's record (Prisma query filter by `user.id` from Supabase).

### Project Structure Alignment
- Dashboard-related pages go in `src/app/(dashboard)/`.
- Forms components go in `src/components/forms/`.

### References
- [Source: docs/planning-artifacts/prd.md#FR2, FR3]
- [Source: docs/planning-artifacts/architecture.md#Project Structure]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Create `(dashboard)` group and `profile` route.
2. Build the `ProfileForm` with Tailwind.
3. Implement Server Action with Prisma 6.
4. Integrate with `cockpitStore.ts` for hydration.

### File List
- `src/app/(dashboard)/profile/page.tsx` (NEW)
- `src/app/(dashboard)/profile/actions.ts` (NEW)
- `src/components/forms/ProfileForm.tsx` (NEW)
- `src/store/cockpitStore.ts` (UPDATE)
- `src/lib/prisma.ts` (NEW)

## Story Completion Status
- **Status:** done
- **Completion Note:** Profile management for weight and protein goal implemented. Zustand store integrated for hydration. Prisma 6 used for database updates.
