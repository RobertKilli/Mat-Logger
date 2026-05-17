---
id: '1.5'
title: 'Modellversjonering'
epicId: '1'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: Modellversjonering

**As a** System,
**I want to** manage and retrieve the active version of metabolic formulas,
**So that** all future physiological calculations can be linked to a specific version for historical integrity.

## Acceptance Criteria

### AC1.5.1: Version Registry [x]
**Given** the metabolic engine
**When** a new formula set is developed
**Then** it is assigned a unique version identifier (e.g., "v1.0-stable")
**And** registered in the system with an `is_active` flag

### AC1.5.2: Active Version Retrieval [x]
**Given** multiple versions in the database
**When** the system performs a calculation
**Then** it automatically retrieves and uses the current active version ID

### AC1.5.3: Schema Readiness [x]
**Given** the existing database models
**When** new tables for logs are created (in future stories)
**Then** they must include a foreign key to the `ModelVersion` table

## Tasks / Subtasks

- [x] Task 1: Setup ModelVersion Seed (AC: 1.5.1)
  - [x] Create a seed script `prisma/seed.ts` to insert the initial "v1.0-base" model version
- [x] Task 2: Implement Version Service (AC: 1.5.2)
  - [x] Create `src/lib/metabolism/versionService.ts`
  - [x] Implement `getActiveModelVersion()` function using Prisma with caching
- [x] Task 3: Metabolic Engine Bridge
  - [x] Update `src/lib/metabolism/index.ts` to export a basic versioned interface
- [x] Task 4: Validation
  - [x] Verify that `getActiveModelVersion()` returns the correct seeded version

## Dev Notes

### Technical Guardrails
- **Integrity:** Scientific accuracy depends on knowing which formulas were used. Never hardcode version strings in logs; always use the DB ID.
- **Performance:** Use a simple cache for the active version to avoid redundant DB lookups during high-velocity logging.
- **Naming:** Version names should follow `vX.Y-suffix` pattern.

### Project Structure Alignment
- Scientific logic stays in `src/lib/metabolism/`.
- Seed data goes in `prisma/seed.ts`.

### References
- [Source: docs/planning-artifacts/prd.md#FR23]
- [Source: docs/planning-artifacts/architecture.md#Novel Patterns]

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Create the seed script.
2. Build the version retrieval service.
3. Establish the base metabolism module structure.

### File List
- `prisma/seed.ts` (NEW)
- `src/lib/metabolism/versionService.ts` (NEW)
- `src/lib/metabolism/index.ts` (UPDATE)

## Story Completion Status
- **Status:** done
- **Completion Note:** Model versioning infrastructure established. Initial seed created and retrieval service implemented with caching.
