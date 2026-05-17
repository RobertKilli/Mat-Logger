---
id: '2.4'
title: '"Fork & Nudge" Funksjonalitet'
epicId: '2'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: "Fork & Nudge" Funksjonalitet

**As a** User,
**I want to** clone an existing food item and tweak its values,
**So that** I can create personalized food entries with minimal effort.

## Acceptance Criteria

### AC2.4.1: "Fork" Action [x]
**Given** an item in the library
**When** I select the "Fork" action
**Then** a new draft entry is created with all macros pre-filled from the original item

### AC2.4.2: "Nudge" Interface [x]
**Given** the forked item draft
**When** I view the macros
**Then** I see +/- "Nudge" buttons next to Protein, Carbs, Fat, and Calories
**And** clicking these buttons increments/decrements the values per 100g

### AC2.4.3: Personal Saving [x]
**Given** adjusted values
**When** I click "Save to My Library"
**Then** a new record is created in the `food_items` table with my `user_id`
**And** it becomes immediately available in my search results (prioritized)

## Tasks / Subtasks

- [x] Task 1: Implement Fork Action (AC: 2.4.1)
  - [x] Add `forkFoodItem` Server Action in `src/app/(dashboard)/library/actions.ts`
- [x] Task 2: Build Nudge Component (AC: 2.4.2)
  - [x] Create `src/components/forms/ForkNudgeForm.tsx`
  - [x] Implement the +/- nudge button logic for macro adjustments
- [x] Task 3: UI Integration (AC: 2.4.1)
  - [x] Update `src/components/dashboard/FoodSearch.tsx` to show a "Fork" button on items
  - [x] Implement a Modal for the Nudge interface
- [x] Task 4: Validation
  - [x] Verify that saving a forked item doesn't overwrite the original global item
  - [x] Verify that the new item correctly appears with the "PERSONAL" tag in search

## Dev Notes

### Technical Guardrails
- **UX Pattern:** "Quick-Nudge Buttons" implemented with responsive state.
- **Data Model:** Personal items marked with `user_id`.
- **UI:** Headless UI Dialog used for the modal transition.

### Project Structure Alignment
- Nudge form in `src/components/forms/ForkNudgeForm.tsx`.
- Updated library actions for data persistence.

### References
- [Source: docs/planning-artifacts/prd.md#FR11, FR12]
- [Source: docs/planning-artifacts/ux-design-specification.md#Novel UX Patterns]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Implement the Server Action to create personal clones.
2. Build the `ForkNudgeForm` with the ring-style or compact technical card.
3. Integrate the form into a Headless UI Dialog (Modal).
4. Hook up the search results to trigger the fork flow.

### File List
- `src/app/(dashboard)/library/actions.ts` (MODIFIED)
- `src/components/forms/ForkNudgeForm.tsx` (NEW)
- `src/components/dashboard/FoodSearch.tsx` (MODIFIED)

## Story Completion Status
- **Status:** done
- **Completion Note:** "Fork & Nudge" pattern fully implemented. Pilots can now clone and adjust food items with tactile +/- buttons.
