---
id: '2.3'
title: 'Matbibliotek & Søk'
epicId: '2'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: Matbibliotek & Søk

**As a** User,
**I want to** search for food items in the database,
**So that** I can quickly find what I am eating without redundant navigation.

## Acceptance Criteria

### AC2.3.1: Real-time Search [x]
**Given** a list of global and personal food items
**When** I type a query in the search bar
**Then** matching items are filtered and displayed in real-time
**And** the search happens as I type (Zero-Wait Feedback)

### AC2.3.2: Prioritized Results [x]
**Given** a search result list
**Then** items created by me (personal items) appear at the top of the list
**And** global items follow

### AC2.3.3: High-Density List [x]
**Given** a mobile screen
**When** I view the library
**Then** the list is compact (Technical Data Cards) using `JetBrains Mono` for macro previews
**And** each item has a prominent "Select" or "Log" action

## Tasks / Subtasks

- [x] Task 1: Enhance FoodItem Schema (AC: 2.3.2)
  - [x] Update `prisma/schema.prisma` to add `user_id` (nullable) to `FoodItem`
  - [x] Add an index on `name` for faster searching
- [x] Task 2: Build Search UI (AC: 2.3.1, 2.3.3)
  - [x] Create `src/components/dashboard/FoodSearch.tsx`
  - [x] Implement a high-density list item component for food
- [x] Task 3: Implement Search Service (AC: 2.3.1, 2.3.2)
  - [x] Create `src/app/(dashboard)/library/actions.ts` to fetch items with user prioritization
- [x] Task 4: Library Route
  - [x] Create `src/app/(dashboard)/library/page.tsx`
- [x] Task 5: Validation
  - [x] Verify that typing "Kylling" returns the seeded chicken item
  - [x] Verify that personal items (if any) are sorted first

## Dev Notes

### Technical Guardrails
- **Performance:** Efficient Prisma queries with case-insensitive search.
- **Styling:** "Midnight Engine" aesthetics with high-contrast elements.
- **UX Pattern:** Library search as the primary entry point for quick-logging.

### Project Structure Alignment
- `src/app/(dashboard)/library/` for library routes.
- `src/components/dashboard/FoodSearch.tsx` for the shared search component.

### References
- [Source: docs/planning-artifacts/prd.md#FR10]
- [Source: docs/planning-artifacts/ux-design-specification.md#User Journey flows]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Update Prisma schema to support personal items.
2. Create the search component with real-time filtering.
3. Build the library page as a scrollable list.
4. Ensure sorting logic (User ID matches current user first).

### File List
- `prisma/schema.prisma` (MODIFIED)
- `src/app/(dashboard)/library/page.tsx` (NEW)
- `src/app/(dashboard)/library/actions.ts` (NEW)
- `src/components/dashboard/FoodSearch.tsx` (NEW)

## Story Completion Status
- **Status:** done
- **Completion Note:** Food library search engine implemented with user-item prioritization and high-density technical cards. Lint passing.
