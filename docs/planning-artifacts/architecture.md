---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: 'torsdag 14. mai 2026'
---

# Architecture Design: Mat-Logger

## Executive Summary
This document outlines the architecture for "Mat-Logger", a high-precision nutrition and training tracking application. The architecture is designed to support real-time metabolic monitoring, data integrity, and a seamless user experience across devices. It leverages a modern full-stack approach with Next.js, Supabase, and Prisma to ensure scalability and developer efficiency.

## Decision Summary

| Category | Decision | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | Best-in-class React framework for SSR/SSG and modern server-centric patterns. |
| **Mobile Bridge** | Capacitor | Allows Next.js to run as a native iOS/Android app with access to health APIs. |
| **Backend / Database** | Supabase (PostgreSQL) | Managed database, authentication, and real-time capabilities in one package. |
| **ORM** | Prisma | Type-safe database access and easy schema management for our "Gram-Only" model. |
| **State Management** | Zustand | Lightweight and powerful state management for real-time "Cockpit" updates. |
| **Styling** | Tailwind CSS | Utility-first CSS for rapid, consistent, and accessible UI development. |
| **Authentication** | Supabase Auth | Seamless integration with the database and support for RLS. |

## Project Structure

```text
mat-logger/
├── prisma/
│   └── schema.prisma          # Sentral definisjon av "Gram-Only" datamodellen
├── public/                    # Statiske ressurser og ikoner
├── src/
│   ├── app/                   # Next.js App Router (Sider og API-ruter)
│   │   ├── api/               # Backend-endepunkter for eksterne integrasjoner
│   │   ├── (auth)/            # Autentiserings-ruter (login/register)
│   │   ├── (dashboard)/       # Hoveddashbord (Cockpit) og analyser
│   │   ├── food-library/      # Forvaltning av matvarer og "Fork & Nudge"
│   │   ├── layout.tsx         # Global layout med WCAG-tilgjengelighet
│   │   └── page.tsx           # Landingsside
│   ├── components/            # Gjenbrukbare UI-komponenter
│   │   ├── dashboard/         # Glykogen-gjeldsklokke, CNS-målere
│   │   ├── forms/             # "Scale-Native" inntastingsskjemaer
│   │   ├── layout/            # Navigasjon og bunntekst
│   │   └── ui/                # Atomiske Tailwind-komponenter
│   ├── hooks/                 # Custom React hooks (f.eks. useSupabaseRealtime)
│   ├── lib/                   # Kjerne-logikk og verktøy
│   │   ├── biometry/          # Unified Health Provider (iOS/Android)
│   │   ├── metabolism/        # Vitenskapelige formler (Glykogen/CNS)
│   │   ├── prisma.ts          # Type-sikker databaseklient
│   │   ├── supabase.ts        # Konfigurert Supabase-klient
│   │   └── utils.ts           # Hjelpefunksjoner (date-fns formatering)
│   ├── store/                 # Zustand-tilstandshåndtering
│   │   └── cockpitStore.ts    # Sentral tilstand for sanntidsmålere
│   ├── types/                 # Delte TypeScript-grensesnitt
│   └── proxy.ts               # Sikkerhet og RLS-håndtering
├── tests/                     # Integrasjons- og E2E-tester
├── .env.local                 # Lokale hemmeligheter (DB-strender)
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Implementation Patterns

### Error Handling & Logging
- **React Error Boundaries:** Used in the frontend to catch UI-level failures and display fallback components.
- **Standardized API Responses:** All API routes follow the format:
  - Success: `{"data": { ... }}`
  - Error: `{"error": {"message": "...", "code": "..."}}`
- **Structured Logging:** Console logging in JSON format for production observability.

### Date & Time Handling
- **Storage:** All timestamps stored in UTC in the database.
- **Display:** Client-side conversion to local time using `date-fns`.

### Naming Conventions
- **API Routes:** `kebab-case`, plural (e.g., `/api/v1/food-logs`).
- **Database Tables:** `snake_case`, plural (e.g., `food_logs`).
- **React Components:** `PascalCase` (e.g., `GlycogenClock.tsx`).
- **Types/Interfaces:** `PascalCase` (e.g., `FoodLog`).

## Novel Patterns

### Pattern: Glycogen Debt Clock (Cockpit)
**Purpose:** Real-time visualization of carbohydrate depletion vs. intake.
- **Components:** `cockpitStore.ts` (Zustand), `GlycogenClock` component, `metabolism/glycogen.ts` logic.
- **Logic:** Calculates theoretical glycogen levels based on time since last carb intake and estimated metabolic rate.

### Pattern: CNS Fatigue Indicator
**Purpose:** Predicting recovery status based on training intensity and volume.
- **Components:** `CNSMeter` component, `metabolism/recovery.ts` logic.
- **Logic:** Uses an exponential decay model to track "fatigue debt" from high-intensity training sessions.

### Pattern: Fork & Nudge (Food Library)
**Purpose:** Streamlining the creation of custom food entries by "forking" existing ones.
- **Components:** `food-library/` routes, `FoodLibraryService`.
- **Logic:** Allows users to select an existing food, adjust its macros per 100g, and save it as a personal entry.

### Pattern: Biometric Correlation Engine
**Purpose:** Replacing simulated decay models with empirical data from Apple HealthKit and Google Health Connect.
- **Components:** `lib/biometry`, `CNSMeter`, `metabolism/recovery.ts`.
- **Logic:** Abstracted provider layer that normalizes biometric signals from different OS-level health stores into a unified `BiometricRecord` format.

## Acceptance Criteria for Architecture
1. The project structure allows for isolated testing of metabolic logic.
2. Real-time updates via Supabase are supported through dedicated hooks.
3. Database access is centralized through Prisma for type safety.
4. Security is enforced via Supabase RLS and Next.js middleware.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
The combination of Next.js for the interface and Supabase for the data layer provides a robust foundation. Prisma ensures type safety across these boundaries, which is critical for the precision required in metabolic calculations. Capacitor enables native access to health APIs on both iOS and Android.

**Pattern Consistency:**
Implementation patterns like "Standardized API Responses" and "Error Boundaries" are consistently applied across the stack. The naming conventions align with industry standards.

**Structure Alignment:**
The directory structure clearly separates the "Metabolic Engine" (`src/lib/metabolism`) from the UI components and the new "Biometry" abstraction layer.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
- **Metabolic Motor (FR1-FR5):** Fully supported by the `metabolism/` logic folder and `cockpitStore.ts`.
- **Data Integrity (FR6-FR10):** Enforced via Prisma's schema and specialized "Scale-Native" forms.
- **Food Library (FR11-FR13):** Architected under the `food-library/` route with the "Fork & Nudge" pattern.
- **Biometric Integration (FR24-FR31):** Supported by Capacitor bridge and the Biometric Correlation Engine for both iOS and Android.

**Non-Functional Requirements Coverage:**
- **Real-time Performance:** Handled by `useSupabaseRealtime` and Zustand.
- **Accessibility:** Integrated into the global layout via WCAG standards.

### Implementation Readiness Validation ✅

**Decision Completeness:** All core stack decisions are finalized.
**Structure Completeness:** The complete directory structure is defined down to the utility level.
**Pattern Completeness:** Novel patterns for the Glycogen Clock, CNS Fatigue, and Biometric Correlation are fully specified.

### Gap Analysis Results
- **Minor Gap:** Development environment setup (local Supabase CLI vs. Cloud) should be decided during the first implementation step.
- **Critical Path:** Native iOS/Android provisioning and Health API entitlements setup required for Empirical mode.

## Deployment Architecture
- **Web:** Vercel (for dashboard and admin).
- **Mobile (iOS):** Native App via TestFlight.
- **Mobile (Android):** Native App via Google Play Internal Testing.
- **Database:** Supabase Cloud.

### Architecture Readiness Assessment

**Overall Status:** **READY FOR IMPLEMENTATION**
**Confidence Level:** **High**

**Key Strengths:**
- Clear separation of concerns between metabolic logic and UI.
- Unified Biometry layer allows for seamless cross-platform health data consumption.
- "Fork & Nudge" pattern provides a unique UX for rapid food logging.

### Implementation Handoff

**AI Agent Guidelines:**
- Prioritize implementing the `metabolism/` logic with 100% test coverage before building the UI.
- All database mutations must pass through the `Scale-Native` validation logic.
- Respect the `cockpitStore.ts` as the single source of truth for the dashboard.

**First Implementation Priority:**
Initialize the Next.js project and set up the Prisma schema for the `food_logs`, `food_items`, and `biometric_records` tables.
