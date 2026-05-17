---
id: '1.1'
title: 'Prosjektinitialisering'
epicId: '1'
status: 'done'
generatedAt: '2026-05-16'
---

# User Story: Prosjektinitialisering

**As a** Developer,
**I want to** initialize the Mat-Logger project using create-next-app and set up the architecture-defined folder structure and Prisma schema,
**So that** I have a consistent and type-safe foundation for development.

## Acceptance Criteria

### AC1.1.1: Project Creation [x]
**Given** no project exists in the root directory
**When** I run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir`
**Then** a Next.js project is initialized with the specified technologies
**And** `npm run lint` passes successfully

### AC1.1.2: Directory Structure [x]
**Given** the initialized project
**When** I create the folders defined in architecture.md
**Then** the `src/` directory includes `components/dashboard`, `components/forms`, `lib/metabolism`, `store/`, and `types/`
**And** placeholders `src/store/cockpitStore.ts` and `src/lib/metabolism/index.ts` are established
**And** a `prisma/` folder is present in the root

### AC1.1.3: Prisma & Environment Configuration [x]
**Given** the project structure
**When** I initialize Prisma and configure the schema
**Then** `schema.prisma` includes `User` (id, email, weight, protein_goal) and `ModelVersion` models using `snake_case` naming
**And** `.env.local` contains placeholders for `DATABASE_URL` and `DIRECT_URL` (Supabase compatibility)
**And** `npx prisma validate` confirms a valid configuration

## Developer Context

### Technical Guardrails
- **Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Prisma, Supabase (PostgreSQL).
- **Naming:** `PascalCase` for React components/types, `snake_case` for database tables/columns.
- **Patterns:** Centralized state in `cockpitStore.ts`, scientific logic in `lib/metabolism/`.

### File Structure Requirements
```text
mat-logger/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── forms/
│   │   └── ui/
│   ├── lib/
│   │   ├── metabolism/
│   │   │   └── index.ts (placeholder)
│   ├── store/
│   │   └── cockpitStore.ts (placeholder)
│   └── types/
└── .env.local (with DATABASE_URL, DIRECT_URL)
```

### Verification Requirements
- All new directories must contain a `.gitkeep` if empty to preserve structure.
- Prisma schema must pass `npx prisma validate`.
- Build must pass `npm run lint`.

## Project Context Reference
- **PRD:** `docs/planning-artifacts/prd.md`
- **Architecture:** `docs/planning-artifacts/architecture.md`
- **UX Spec:** `docs/planning-artifacts/ux-design-specification.md`

## Story Completion Status
- **Status:** done
- **Completion Note:** Project initialized successfully with Next.js, Prisma, and architecture folder structure. All validation tests passed.
