---
id: '4.3'
title: 'Bakgrunns-synkronisering'
epicId: '4'
status: 'review'
generatedAt: '2026-05-17'
---

# User Story: Bakgrunns-synkronisering

**As a** User,
**I want** my local changes to be automatically saved to the cloud when I regain connection,
**So that** my data is never lost and remains consistent across devices.

## Acceptance Criteria

### AC4.3.1: Automatisk Deteksjon av Tilkobling
**Given** there are items in the `pendingSyncQueue`
**When** the browser's online status changes from offline to online
**Then** the synchronization process is automatically triggered.

### AC4.3.2: Sekvensiell Prosessering av Kø
**Given** the sync process is triggered
**When** processing the `pendingSyncQueue`
**Then** items must be sent to the server in the same order they were logged (FIFO)
**And** each successful sync must remove the item from the local queue.

### AC4.3.3: Håndtering av Feil under Synkronisering
**Given** an item fails to sync due to a server error (e.g., 500)
**When** processing the queue
**Then** the sync process should stop and keep the remaining items in the queue
**And** the UI should reflect the failed sync state (e.g., "Sync failed, retrying...").

### AC4.3.4: Visuell Tilbakemelding (Syncing State)
**Given** the synchronization is in progress
**When** viewing the `SyncStatus` component
**Then** I see a "SYNCING..." indicator (e.g., a rotating cloud icon).

## Tasks / Subtasks

- [x] Task 1: Implementer `processSyncQueue` i `syncService.ts` (AC: 4.3.2)
  - [x] Lag en asynkron funksjon som itererer gjennom `pendingSyncQueue`.
  - [x] Kall de relevante Server Actions (`logFoodEntry` eller `logWorkout`) for hvert element.
  - [x] Implementer feilhåndtering som avbryter loopen ved feil.
- [x] Task 2: Trigger Synkronisering ved Reconnect (AC: 4.3.1)
  - [x] Oppdater `useOnlineStatus` eller lag en `SyncProvider` som lytter på `online`-eventet.
  - [x] Trigge `processSyncQueue` når `navigator.onLine` blir true.
- [x] Task 3: Oppdater UI-tilstand i `SyncStatus.tsx` (AC: 4.3.4)
  - [x] Legg til en `isSyncing` tilstand i `cockpitStore.ts` eller lokalt i komponenten.
  - [x] Vis en animert "Syncing"-indikator når prosessen pågår.
- [x] Task 4: Validering og Testing
  - [x] Simuler offline-logging og verifiser at data lagres i køen.
  - [x] Gå online og verifiser at data sendes til Supabase og fjernes fra lokal kø.
  - [x] Verifiser at rekkefølgen (timestamp) bevares.

## Dev Notes

### Technical Guardrails
- **FIFO Rekkefølge:** Det er kritisk at mat- og treningslogger sendes i riktig rekkefølge for å bevare integriteten i de metabolske beregningene (modellversjonering og tidsstempler).
- **Server Actions:** Husk at Server Actions krever `isOnline` for å kjøre. Bruk try/catch rundt hvert kall i køen.
- **Idempotens:** Siden vi ikke har unike ID-er generert på klienten ennå (bruker timestamp som når køen), må vi være forsiktige med duplikater hvis synkroniseringen avbrytes midtveis.

### Project Structure Alignment
- Synkroniseringslogikk bør ligge i `src/lib/metabolism/syncService.ts`.
- UI-komponenter i `src/components/layout/`.

### References
- [Source: docs/planning-artifacts/prd.md#FR22]
- [Source: src/store/cockpitStore.ts] - Se `pendingSyncQueue` definisjon.
- [Source: src/lib/metabolism/syncService.ts] - Eksisterende `executeLogAction` logikk.

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash (CLI)

### Implementation Plan
1. Oppdatert `cockpitStore.ts` med `isSyncing` tilstand.
2. Implementert `processSyncQueue` i `syncService.ts` med FIFO-logikk.
3. Oppdatert `SyncStatus.tsx` til å lytte på `online`-endringer og trigge synkronisering.
4. Refaktorert `logWorkout` til å ikke bruke `redirect` internt, slik at den kan brukes i bakgrunnskøen.

### File List
- `src/store/cockpitStore.ts` (UPDATE)
- `src/lib/metabolism/syncService.ts` (UPDATE)
- `src/components/layout/SyncStatus.tsx` (UPDATE)
- `src/app/(dashboard)/training/actions.ts` (UPDATE)

### Change Log
- **2026-05-17:** Implementert bakgrunns-synkronisering med FIFO-kø og visuell status.

## Story Completion Status
- **Status:** review
- **Completion Note:** Bakgrunns-synkronisering er nå fullført. Systemet detekterer automatisk når brukeren kommer online og tømmer køen sekvensielt.
