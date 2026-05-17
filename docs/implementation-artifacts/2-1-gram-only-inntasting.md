---
id: '2.1'
title: '"Gram-Only" Inntasting'
epicId: '2'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: "Gram-Only" Inntasting

**As a** User,
**I want to** log a food item by entering its weight in grams,
**So that** I have high-precision data for my metabolic tracking.

## Acceptance Criteria

### AC2.1.1: Precision Entry UI [x]
**Given** a selected food item
**When** the logging interface is active
**Then** I see a large numeric input field for "Grams"
**And** the numeric keyboard (numpad) is focused automatically on mobile

### AC2.1.2: Input Validation [x]
**Given** the gram input field
**When** I enter a value
**Then** the value must be a positive number
**And** the "Log Item" button is only enabled when a valid weight (> 0) is present

### AC2.1.3: Scaled Macros Calculation [x]
**Given** a weight in grams
**When** I type the digits
**Then** the UI displays the calculated macros for that specific weight based on the item's 100g values
**And** this update happens in real-time (Zero-Wait Feedback)

### AC2.1.4: Database Persistence [x]
**Given** a valid gram entry
**When** I click "Log Item"
**Then** a record is created in the `food_logs` table via Prisma
**And** it includes the `user_id`, `food_item_id`, `weight_grams`, and the current `model_version_id`

## Tasks / Subtasks

- [x] Task 1: Update Prisma Schema (AC: 2.1.4)
  - [x] Add `FoodItem` model (name, protein, carbs, fat, calories per 100g)
  - [x] Add `FoodLog` model (user_id, food_item_id, weight_grams, model_version_id, logged_at)
  - [x] Define relations (User -> FoodLog, FoodItem -> FoodLog, ModelVersion -> FoodLog)
- [x] Task 2: Build GramEntry Component (AC: 2.1.1, 2.1.2)
  - [x] Create `src/components/forms/GramEntryForm.tsx`
  - [x] Implement auto-focus logic for the input
- [x] Task 3: Real-time Calculation Logic (AC: 2.1.3)
  - [x] Implement macro calculation utility in `src/lib/metabolism/macros.ts`
  - [x] Bind component state to the display values
- [x] Task 4: Logging Action (AC: 2.1.4)
  - [x] Create `src/app/(dashboard)/quick-log/actions.ts` to save the log entry
  - [x] Ensure `model_version_id` is retrieved via `MetabolicMotor.getContext()`
- [x] Task 5: Validation
  - [x] Verify that non-numeric input is prevented
  - [x] Verify that log entry correctly references the active model version

## Dev Notes

### Technical Guardrails
- **Performance:** Calculations handled client-side for immediate feedback.
- **Data Integrity:** "Gram-Only" strictly enforced.
- **Accessibility:** `inputMode="decimal"` used for mobile focus.
- **Naming:** DB tables `food_items` and `food_logs` added.

### Project Structure Alignment
- `src/app/(dashboard)/quick-log/` created for the entry route.
- `src/lib/metabolism/macros.ts` for scientific scaling.

### References
- [Source: docs/planning-artifacts/prd.md#FR6, FR7]
- [Source: docs/planning-artifacts/architecture.md#Novel Patterns]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Update and migrate Prisma schema.
2. Implement the `MetabolicMotor` macro calculator.
3. Build the `GramEntryForm` with Tailwind and auto-focus.
4. Hook up the Server Action for saving to DB.

### File List
- `prisma/schema.prisma` (MODIFIED)
- `src/components/forms/GramEntryForm.tsx` (NEW)
- `src/lib/metabolism/macros.ts` (NEW)
- `src/app/(dashboard)/quick-log/actions.ts` (NEW)
- `src/app/(dashboard)/quick-log/page.tsx` (NEW)
- `prisma/seed.ts` (MODIFIED)

## Story Completion Status
- **Status:** done
- **Completion Note:** Gram-only logging engine implemented with real-time macro scaling and Prisma persistence. Initial seed data added for testing.
