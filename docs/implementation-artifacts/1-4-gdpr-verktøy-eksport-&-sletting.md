---
id: '1.4'
title: 'GDPR Verktøy (Eksport & Sletting)'
epicId: '1'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: GDPR Verktøy (Eksport & Sletting)

**As a** User,
**I want to** export my data or delete my account,
**So that** I have full control over my personal information and comply with privacy rights.

## Acceptance Criteria

### AC1.4.1: Data Export [x]
**Given** a logged-in user on the privacy settings page
**When** I click "Export My Data"
**Then** the system compiles all my food logs, workout logs, and profile data
**And** triggers a download of a JSON file containing this data

### AC1.4.2: Account Deletion [x]
**Given** a logged-in user who wants to delete their account
**When** I click "Delete Account" and confirm the destructive action in a modal
**Then** the system deletes my record from the `users` table
**And** deletes my authentication record in Supabase Auth
**And** redirects me to the landing page in a logged-out state

### AC1.4.3: Secure Data Purge [x]
**Given** an account deletion request
**When** the user is deleted
**Then** all related data (logs, settings) is also removed (due to ON DELETE CASCADE or manual cleanup in Prisma)

## Tasks / Subtasks

- [x] Task 1: Create Privacy UI (AC: 1.4.1, 1.4.2)
  - [x] Create `src/app/(dashboard)/settings/privacy/page.tsx`
  - [x] Implement `GDPRTools` component with Export and Delete actions
- [x] Task 2: Implement Data Export Logic (AC: 1.4.1)
  - [x] Create an API route or Server Action to fetch and format user data
  - [x] Implement JSON generation for the export
- [x] Task 3: Implement Account Deletion Logic (AC: 1.4.2, 1.4.3)
  - [x] Create a Server Action to handle account deletion
  - [x] Ensure cascading deletion in Prisma schema (or manual cleanup)
  - [x] Use `supabase.auth.admin.deleteUser` (requires service role key or user's own token if permitted)
- [x] Task 4: Validation & Testing
  - [x] Verify that exported JSON contains correct data
  - [x] Verify that deletion correctly logs the user out and wipes data

## Dev Notes

### Technical Guardrails
- **Security:** Account deletion is extremely destructive. Use a double-confirmation modal.
- **Supabase Admin:** Deleting a user from `auth.users` typically requires the service role key if done via the management API.
- **Export Format:** Prefer JSON for maskinlesbarhet (FR4).

### Project Structure Alignment
- Settings sub-pages go in `src/app/(dashboard)/settings/`.

### References
- [Source: docs/planning-artifacts/prd.md#FR4, FR5]
- [Source: docs/planning-artifacts/architecture.md#Decision Summary]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Update Prisma schema for cascading deletes if necessary.
2. Build the Privacy settings UI.
3. Implement the export functionality (fetch data -> JSON string -> download).
4. Implement the deletion flow (delete profile -> delete auth -> redirect).

### File List
- `src/app/(dashboard)/settings/privacy/page.tsx` (NEW)
- `src/app/(dashboard)/settings/privacy/actions.ts` (NEW)
- `src/app/api/export/route.ts` (NEW)
- `src/components/dashboard/GDPRTools.tsx` (NEW)

## Story Completion Status
- **Status:** done
- **Completion Note:** GDPR compliance tools (Export & Deletion) implemented successfully. Lint passing.
