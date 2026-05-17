---
id: '4.2'
title: 'Local-first Cockpit'
epicId: '4'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: Local-first Cockpit

**As a** User,
**I want to** use the app and log my data even without an internet connection,
**So that** I can continue my tracking routine in gym basements or remote areas.

## Acceptance Criteria

### AC4.2.1: State Persistence
**Given** the application state in the "Body Cockpit"
**When** the app is refreshed or closed
**Then** the baseline data and daily totals are recovered from local storage
**And** the indicators (Glycogen/CNS) reflect the persisted state immediately

### AC4.2.2: Offline Logging Queue
**Given** no active internet connection
**When** I perform a "Log Item" or "Record Session" action
**Then** the action is added to a `pendingSyncQueue` in the local store
**And** the UI indicators (Cockpit) update immediately as if the action was successful

### AC4.2.3: Sync Status Indicator
**Given** the application header
**When** the device is offline
**Then** I see an "OFFLINE MODE" indicator
**When** there are items in the `pendingSyncQueue`
**Then** I see a "PENDING SYNC" count (e.g., "3 logs pending")

## Tasks / Subtasks

- [x] Task 1: Zustand Persistence (AC: 4.2.1)
  - [x] Implement Zustand `persist` middleware in `src/store/cockpitStore.ts`
  - [x] Configure `localStorage` as the storage engine
- [x] Task 2: Implement Sync Queue (AC: 4.2.2)
  - [x] Add `pendingSyncQueue` array to the store
  - [x] Create a client-side `executeLogAction` utility that handles offline queuing
- [x] Task 3: Build SyncStatus Component (AC: 4.2.3)
  - [x] Create `src/components/layout/SyncStatus.tsx`
  - [x] Use `navigator.onLine` and a custom `useOnlineStatus` hook
- [x] Task 4: UI Integration
  - [x] Integrate `SyncStatus` into the global layout header
  - [x] Update log buttons to handle the local-first flow
- [x] Task 5: Validation
  - [x] Verify that logging while "Offline" (simulated) updates the dashboard
  - [x] Verify that data remains in the queue after a page refresh

## Dev Notes

### Technical Guardrails
- **Offline Logic:** Server Actions (`'use server'`) cannot be called while offline. The UI must detect connectivity *before* attempting the call and fallback to the queue.
- **Data Shapes:** Items in the queue must store the full payload required by the Prisma schema (including `model_version_id` and `logged_at`).
- **UI:** The "Pending Sync" indicator should be a small, non-obtrusive icon in the header (e.g., a cloud with a badge).

### Project Structure Alignment
- Global components in `src/components/layout/`.
- Store logic remains central in `src/store/`.

### References
- [Source: docs/planning-artifacts/prd.md#FR21]
- [Source: docs/planning-artifacts/architecture.md#Implementation Patterns - Date & Time]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Add `persist` middleware to the Zustand store.
2. Create the `useOnlineStatus` hook.
3. Build the `executeLogAction` wrapper for both food and workout logs.
4. Implement the status indicator in the header.

### File List
- `src/store/cockpitStore.ts` (UPDATE)
- `src/hooks/useOnlineStatus.ts` (NEW)
- `src/components/layout/SyncStatus.tsx` (NEW)
- `src/app/layout.tsx` (UPDATE)

## Story Completion Status
- **Status:** ready-for-dev
- **Completion Note:** Ultimate context engine analysis completed - comprehensive developer guide created for local-first persistence and queuing.
