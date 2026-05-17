---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
inputDocuments: [docs/planning-artifacts/prd.md, docs/planning-artifacts/architecture.md]
workflowType: 'epics'
status: complete
completedAt: 'fredag 15. mai 2026'
---

# Mat-Logger - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Mat-Logger, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR1:** Brukeren kan opprette og administrere en profil.
- **FR2:** Brukeren kan registrere og oppdatere sin nåværende kroppsvekt.
- **FR3:** Brukeren kan definere et standard daglig proteinmål.
- **FR4:** Brukeren kan eksportere alle egne data i et maskinlesbart format (JSON/CSV).
- **FR5:** Brukeren kan slette sin konto og alle tilhørende data permanent.
- **FR6:** Brukeren kan loggføre matvarer ved å oppgi nøyaktig vekt i gram.
- **FR7:** Systemet skal automatisk beregne makronæringsstoffer og kalorier basert på vekt og næringsinnhold per 100g.
- **FR8:** Brukeren kan se en sanntidsoppsummering av dagens totale inntak.
- **FR9:** Systemet skal håndtere inntasting av matvarenavn og næringsverdier per 100g for nye varer.
- **FR10:** Brukeren kan søke etter og velge matvarer fra et bibliotek.
- **FR11:** Brukeren kan kopiere ("Fork") en eksisterende matvare for å lage en personlig variant.
- **FR12:** Brukeren kan justere ("Nudge") verdier på en kopiert matvare før lagring.
- **FR13:** Brukeren kan loggføre treningsøkter kategorisert som "Push", "Pull" eller "Legs".
- **FR14:** Brukeren kan registrere intensitetsnivå for hver økt.
- **FR15:** Brukeren kan se historikk over tidligere treningsøkter.
- **FR16:** Systemet skal visualisere "Glycogen Debt Clock" basert på karbohydratinntak og tid.
- **FR17:** Systemet skal visualisere "CNS Fatigue Indicator" basert på treningshistorikk og intensitet.
- **FR18:** Systemet skal gi prediktive indikasjoner på fysiologisk beredskap.
- **FR19:** Brukeren kan gi subjektiv feedback på energinivå for kalibrering.
- **FR20:** Systemet skal støtte optimistiske grensesnittoppdateringer ("as-you-go").
- **FR21:** Systemet skal kunne oppdatere lokale indikatorer uten internett (Local-first).
- **FR22:** Systemet skal synkronisere lokale endringer til server når nettet er tilbake.
- **FR23:** Systemet skal lagre modellversjonen brukt for hver beregning.

### NonFunctional Requirements

- **NFR1 (Ytelse):** Indikatorer skal oppdateres < 200ms etter inntasting.
- **NFR2 (Lastetid):** LCP skal være under 1 sekund.
- **NFR3 (Sikkerhet):** All helsedata beskyttes med Supabase RLS.
- **NFR4 (Autentisering):** Sikker JWT-autentisering via Supabase Auth.
- **NFR5 (Tilgjengelighet):** Full overholdelse av WCAG 2.1 AA-standarden.
- **NFR6 (Gym-resiliens):** Local-first arkitektur sikrer at Cockpit fungerer uavhengig av nettverksforhold i gymmet.

### Additional Requirements

- **Starter Template:** `npx create-next-app` (implisitt første prioritet).
- **Frontend:** Next.js (App Router), Tailwind CSS.
- **Backend / Database:** Supabase (PostgreSQL), Supabase Auth.
- **ORM:** Prisma for type-sikker databaseaksess.
- **State Management:** Zustand (`cockpitStore.ts`) for sanntidsoppdateringer.
- **Metabolic Patterns:** Glycogen Debt Clock og CNS Fatigue Indicator (lib/metabolism).
- **UX Patterns:** "Fork & Nudge" i matbiblioteket.
- **Naming Conventions:** `kebab-case` API ruter, `snake_case` DB tabeller, `PascalCase` komponenter/typer.
- **Testing:** 100% testdekning for `metabolism/` logikk før UI-utvikling.
- **Sikkerhet:** Row Level Security (RLS) og Next.js middleware.

### UX Design Requirements

*None formally documented*

### FR Coverage Map

- **FR1:** Epic 1 - Brukerprofilering
- **FR2:** Epic 1 - Vektsporing
- **FR3:** Epic 1 - Proteinmål
- **FR4:** Epic 1 - GDPR Eksport
- **FR5:** Epic 1 - GDPR Sletting
- **FR6:** Epic 2 - Gram-loggingsmotor
- **FR7:** Epic 2 - Makroberegning
- **FR8:** Epic 2 - Daglig total visning
- **FR9:** Epic 2 - Matvareopprettelse
- **FR10:** Epic 2 - Biblioteksøk
- **FR11:** Epic 2 - Fork matvare
- **FR12:** Epic 2 - Nudge matvare
- **FR13:** Epic 3 - Treningslogging (PPL)
- **FR14:** Epic 3 - Intensitetsregistrering
- **FR15:** Epic 3 - Treningshistorikk
- **FR16:** Epic 3 - Glycogen Debt Clock
- **FR17:** Epic 3 - CNS Fatigue Indicator
- **FR18:** Epic 3 - Beredskapsvarsling
- **FR19:** Epic 3 - Kalibrerings-feedback
- **FR20:** Epic 4 - As-you-go UI
- **FR21:** Epic 4 - Local-first tilstand
- **FR22:** Epic 4 - Supabase synkronisering
- **FR23:** Epic 1 - Modellversjonering

## Epic List

### Epic 1: Plattformfundament & Brukerprofil
Mål: Etablere infrastrukturen og la brukeren administrere sin fysiologiske baseline (vekt, proteinmål).
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR23.

### Epic 2: Høypresisjons Matlogging & Bibliotek
Mål: Implementere "Gram-Only" loggingsmotoren og "Fork & Nudge" biblioteket for rask og nøyaktig inntasting.
**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11, FR12.

### Epic 3: Body Cockpit & Treningsmotor
Mål: Bygge den aktive "Metabolic Motor" som sporer økter og viser sanntids fysiologisk feedback (CNS/Glykogen).
**FRs covered:** FR13, FR14, FR15, FR16, FR17, FR18, FR19.

### Epic 4: Resiliens & Tilgjengelighet
Mål: Sikre at appen fungerer perfekt i gymmet (offline/synk) og møter profesjonelle standarder.
**FRs covered:** FR20, FR21, FR22.

---

## Epic 1: Plattformfundament & Brukerprofil

Dette epics mål er å sette opp det tekniske rammeverket og la brukeren definere sin identitet og fysiologiske utgangspunkt.

### Story 1.1: Prosjektinitialisering

As a Developer,
I want to initialize the Mat-Logger project using create-next-app and set up the architecture-defined folder structure and Prisma schema,
So that I have a consistent and type-safe foundation for development.

**Acceptance Criteria:**

**Given** no project exists in the root directory
**When** I run the creation command with TypeScript, Tailwind, and App Router
**Then** a Next.js project is initialized with the architecture folder structure
**And** Prisma is configured with a schema supporting Users and model versioning

### Story 1.2: Autentisering via Supabase

As a User,
I want to register an account and log in using my email,
So that my logging data is securely stored and private to me.

**Acceptance Criteria:**

**Given** a user on the registration page
**When** I enter a valid email and password
**Then** a new user account is created in Supabase Auth
**And** I am logged in and redirected to the main dashboard

### Story 1.3: Fysiologisk Baseline

As a User,
I want to set my current body weight and a daily protein goal,
So that the app can personalize my targets and metabolic calculations.

**Acceptance Criteria:**

**Given** a logged-in user on the settings page
**When** I input my weight (kg) and daily protein goal (g)
**Then** the values are saved to my user profile in the database
**And** these values are used for subsequent calculations

### Story 1.4: GDPR Verktøy (Eksport & Sletting)

As a User,
I want to export my data or delete my account,
So that I have full control over my personal information and comply with privacy rights.

**Acceptance Criteria:**

**Given** a user who wants to leave or archive data
**When** I trigger a "Download Data" request
**Then** a JSON/CSV file containing all my logs is generated for download
**And** when I trigger "Delete Account", all my data is purged from Supabase and PostgreSQL

### Story 1.5: Modellversjonering

As a System,
I want to store the active version of the metabolic formulas with every log entry,
So that historical data remains accurate even if formulas are updated.

**Acceptance Criteria:**

**Given** a log entry being saved
**When** the system processes the entry
**Then** the current formula version ID is stored alongside the calculated values

---

## Epic 2: Høypresisjons Matlogging & Bibliotek

Dette epics mål er å implementere "Gram-Only" loggingsmotoren og "Fork & Nudge" biblioteket for rask og nøyaktig inntasting.

### Story 2.1: "Gram-Only" Inntasting

As a User,
I want to log a food item by entering its weight in grams,
So that I have high-precision data for my metabolic tracking.

**Acceptance Criteria:**

**Given** a selected food item from the library
**When** I enter the weight in grams into the input field
**Then** the input is validated as a positive numeric value
**And** the "Log Item" action is enabled

### Story 2.2: Sanntids Makro-kalkulator

As a User,
I want to see the calculated macro values update as I type the weight,
So that I know exactly det fysiologiske avtrykket før jeg lagrer loggen.

**Acceptance Criteria:**

**Given** a food item with defined macros per 100g
**When** I change the weight value in the input field
**Then** the total protein, karbohydrater, fett og kalorier oppdateres umiddelbart i grensesnittet
**And** beregningen følger formelen: (Verdi_per_100g / 100) * Inntastede_Gram

### Story 2.3: Matbibliotek & Søk

As a User,
I want to search for food items in the database,
So that I can quickly find what I am eating without redundant navigation.

**Acceptance Criteria:**

**Given** a list of global and personal food items
**When** I type a query in the search bar
**Then** matching items are displayed in real-time
**And** personal "forked" items are prioritized in the results list

### Story 2.4: "Fork & Nudge" Funksjonalitet

As a User,
I want to clone an existing food item and tweak its values,
So that I can create personalized food entries with minimal effort.

**Acceptance Criteria:**

**Given** an existing food item in the global library
**When** I select the "Fork" action
**Then** a personal copy is created with all values pre-filled
**And** I can "Nudge" (justere) makro-verdiene per 100g før jeg lagrer den til mitt eget bibliotek

### Story 2.5: Daglig Totaloppsummering

As a User,
I want to see my total protein, carb, fat, and calorie intake for the day,
So that I can monitor my progress against my baseline targets.

**Acceptance Criteria:**

**Given** logged items for the current day
**When** I view the dashboard (Cockpit)
**Then** the sum of all macros and calories is calculated and displayed clearly
**And** the display updates automatically when a new item is logged

---

## Epic 3: Body Cockpit & Treningsmotor

Dette epics mål er å bygge den aktive "Metabolic Motor" som sporer økter og viser sanntids fysiologisk feedback (CNS/Glykogen).

### Story 3.1: Treningslogging (PPL)

As a User,
I want to log my Push, Pull, or Legs workout with a duration and intensity rating,
So that the system can calculate my CNS fatigue and metabolic demand.

**Acceptance Criteria:**

**Given** a logged-in user on the training page
**When** I select a workout category (Push/Pull/Legs), enter duration (min), and intensity (1-10)
**Then** the session is saved to the WorkoutLogs table
**And** the CNS fatigue model is triggered to update my readiness score

### Story 3.2: Glycogen Debt Clock

As a User,
I want to see my current glycogen status as a countdown or visual clock,
So that I can plan my carbohydrate intake for optimal performance.

**Acceptance Criteria:**

**Given** my carbohydrate intake history and recent activity
**When** I view the dashboard
**Then** a "Glycogen Debt Clock" visualizes my current saturation level
**And** the clock counts down (depletion) over time based on my basal metabolic rate

### Story 3.3: CNS Fatigue Indicator

As a User,
I want to see a representation of my nervous system fatigue,
So that I know when to prioritize recovery over high-intensity training.

**Acceptance Criteria:**

**Given** my recent training frequency and intensity logs
**When** I check the dashboard
**Then** a "CNS Fatigue Indicator" shows my current neurological readiness (e.g., Red/Yellow/Green)
**And** it provides a predicted timeframe for full recovery

### Story 3.4: Treningshistorikk

As a User,
I want to view a list of my previous workouts,
So that I can track my consistency and intensity trends.

**Acceptance Criteria:**

**Given** multiple past workout entries
**When** I navigate to the history page
**Then** I see a chronological list of sessions with category, date, and intensity

### Story 3.5: Fysiologisk Feedback-loop

As a User,
I want to provide subjective feedback on how I actually feel compared to the app's indicators,
So that the "Metabolic Motor" can be calibrated to my unique physiology.

**Acceptance Criteria:**

**Given** the app shows a specific readiness state
**When** I complete a workout and provide a "How did you feel?" rating
**Then** the difference between predicted and actual feeling is logged for calibration
**And** the system provides a confirmation that the feedback was captured

---

## Epic 4: Resiliens & Tilgjengelighet

Dette epics mål er å sikre at appen fungerer perfekt i gymmet (offline/synk) og møter profesjonelle standarder.

### Story 4.1: As-you-go UI

As a User,
I want the fysiologiske indikatorene to update instantly as I input data,
So that I get immediate visual confirmation of the impact of my actions.

**Acceptance Criteria:**

**Given** the food logging or workout entry form
**When** I change an input value (e.g., grams)
**Then** the cockpitStore.ts (Zustand) is updated immediately
**And** the dashboard components (Glycogen Clock, etc.) reflect the change without waiting for a server response

### Story 4.2: Local-first Cockpit

As a User,
I want the app to remain functional and responsive even if I lose internet connection,
So that I can continue logging my sessions in the gym without interruption.

**Acceptance Criteria:**

**Given** no active internet connection
**When** I perform logging actions
**Then** the app stores the changes in a local queue (Zustand/LocalStorage)
**And** the UI shows a "pending sync" status indicator

### Story 4.3: Bakgrunns-synkronisering

As a User,
I want my local changes to be automatically saved to the cloud when I regain connection,
So that my data is never lost and remains consistent across devices.

**Acceptance Criteria:**

**Given** pending local changes and a restored internet connection
**When** the system detects connectivity
**Then** it automatically pushes the local queue to Supabase
**And** it updates the sync status to "Saved"

### Story 4.4: Tilgjengelighetspolering (WCAG)

As a User with accessibility needs,
I want the application to be navigable via keyboard and screen readers,
So that I can use the app effectively regardless of my physical abilities.

**Acceptance Criteria:**

**Given** the live application
**When** I audit for WCAG 2.1 AA compliance
**Then** all text has a minimum contrast ratio of 4.5:1
**And** all interactive elements have descriptive ARIA labels
**And** the entire app can be navigated using only the Tab and Enter keys
