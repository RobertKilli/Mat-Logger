---
id: '1.2'
title: 'Autentisering via Supabase'
epicId: '1'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: Autentisering via Supabase

**As a** User,
**I want to** register an account and log in using my email,
**So that** my logging data is securely stored and private to me.

## Acceptance Criteria

### AC1.2.1: User Registration [x]
**Given** a user on the registration page (`/register`)
**When** I enter a valid email and password
**Then** a new user account is created in Supabase Auth
**And** I am logged in and redirected to the main dashboard

### AC1.2.2: User Login [x]
**Given** a user on the login page (`/login`)
**When** I enter a valid email and password
**Then** I am authenticated via Supabase Auth
**And** I am logged in and redirected to the main dashboard

### AC1.2.3: Session Management [x]
**Given** an authenticated user
**When** I close the browser and return later
**Then** my session is maintained via middleware and I am not forced to log in again unless the session expired

### AC1.2.4: Secure Redirects [x]
**Given** a non-authenticated user trying to access the dashboard
**When** the request is processed by middleware
**Then** I am redirected to the login page

## Tasks / Subtasks

- [x] Task 1: Install and configure Supabase SSR (AC: 1.2.1, 1.2.2)
  - [x] Install `@supabase/supabase-js` and `@supabase/ssr`
  - [x] Set up `src/utils/supabase/client.ts` and `src/utils/supabase/server.ts` (Next.js 15 async cookies)
- [x] Task 2: Implement Middleware (AC: 1.2.3, 1.2.4)
  - [x] Create `src/middleware.ts` for session refreshing and route protection
- [x] Task 3: Auth Callback Route (AC: 1.2.1)
  - [x] Create `src/app/auth/callback/route.ts` to handle email confirmation redirects
- [x] Task 4: UI Components for Auth (AC: 1.2.1, 1.2.2)
  - [x] Create `src/app/(auth)/login/page.tsx` with server actions for login
  - [x] Create `src/app/(auth)/register/page.tsx` with server actions for registration
- [x] Task 5: Validation & Testing
  - [x] Verify registration flow with a test email
  - [x] Verify login flow
  - [x] Verify middleware protection for `/` (dashboard)

## Dev Notes

### Technical Guardrails
- **Stack:** Next.js 15 (App Router), `@supabase/ssr`.
- **Implementation:** Use **Server Actions** for form submissions to keep logic on the server.
- **Middleware:** Must refresh the token if it's nearing expiry to prevent logout during active sessions.
- **Naming:** Follow `PascalCase` for React components.

### Project Structure Alignment
- Auth routes should be in `src/app/(auth)/`.
- Supabase utility clients in `src/utils/supabase/`.
- Middleware in `src/middleware.ts`.

### References
- [Source: docs/planning-artifacts/prd.md#FR4, FR5]
- [Source: docs/planning-artifacts/architecture.md#ADR-003]

## Dev Agent Record

### Implementation Plan
1. Install dependencies.
2. Setup Supabase clients (Client/Server).
3. Implement middleware.
4. Build Login/Register pages with Server Actions.
5. Add Auth Callback for email confirmation support.

### Debug Log References

### Completion Notes List
- Successfully integrated Supabase Auth using `@supabase/ssr`.
- Implemented robust middleware for session persistence and route protection.
- Created "Midnight Engine" themed Login and Register pages.
- Verified build and linting.

### File List
- `src/utils/supabase/client.ts` (NEW)
- `src/utils/supabase/server.ts` (NEW)
- `src/middleware.ts` (NEW)
- `src/app/auth/callback/route.ts` (NEW)
- `src/app/(auth)/login/page.tsx` (NEW)
- `src/app/(auth)/register/page.tsx` (NEW)
- `src/app/(auth)/actions.ts` (NEW)
- `src/app/page.tsx` (MODIFIED)

## Story Completion Status
- **Status:** done
- **Completion Note:** Supabase Auth implemented successfully. All ACs satisfied. Lint passing.
