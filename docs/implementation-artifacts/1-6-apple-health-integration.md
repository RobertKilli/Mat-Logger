# Artifact 1-6: Apple HealthKit Integrasjon

**Status:** Planned (Tactical Priority: HIGH)
**Role:** Transition from Simulation to Empirical Data

## 1. Målsetning
Etablere en sikker og stabil bro mellom Apple Health og BODY COCKPIT OS for å hente rå biometri som erstatter/forsterker de simulerte metabolsk- og restitusjonsmodellene.

## 2. Tekniske Komponenter

### A. Capacitor HealthKit Plugin
*   **Modul:** `@capacitor-community/apple-health`
*   **Funksjon:** Aksessere native iOS `HKHealthStore`.
*   **Data-scopes:** 
    *   `HRV` (Heart Rate Variability)
    *   `RHR` (Resting Heart Rate)
    *   `SleepAnalysis`
    *   `ActiveEnergyBurned`
    *   `StepCount`

### B. Health Sync Service (`src/lib/healthkit/sync.ts`)
*   Logikk for å polle data ved app-start og bakgrunns-oppdatering.
*   Mapping av rå Apple Health-objekter til `BiometricRecord` i databasen.
*   Håndtering av tidsstempler for å unngå duplikater (UTC-synkronisering).

### C. Biometric-Augmented Metabolism (`src/lib/metabolism/biometric-bridge.ts`)
*   **Glycogen Adjustment:** Bruker `ActiveEnergyBurned` fra Apple Health for å justere utmatingstakten på `Glycogen Debt Clock`.
*   **CNS Calibration:** Bruker HRV-trender som en "multiplier" på tretthetsindikatoren. 
    *   *Eksempel:* Hvis HRV er >1 standardavvik under 7-dagers snitt, markeres CNS som "ELEVATED FATIGUE" uavhengig av treningsvolum.

## 3. Brukeropplevelse (UX)
1.  **Permission Request:** Tactical briefing-overlay som forklarer *hvorfor* systemet trenger tilgang (Ytelsesoptimalisering).
2.  **Consent Dialog:** Standard Apple Health tillatelses-skjerm.
3.  **Status Indicator:** Liten "Health Link Active" ikon i Cockpiten når data er synkronisert.

## 4. Datamodell Oppdatering (Prisma)
Legge til `Biometrics`-tabell:
```prisma
model BiometricRecord {
  id        String   @id @default(uuid())
  userId    String
  type      String   // HRV, RHR, SLEEP, CALORIES
  value     Float
  unit      String
  timestamp DateTime
  source    String   // "AppleHealth"
  user      User     @relation(fields: [userId], references: [id])

  @@index([userId, timestamp])
}
```

## 5. Akseptansekriterier
*   [ ] Appen kan be om tillatelse til Apple Health via Capacitor.
*   [ ] Siste 24 timer med HRV hentes og lagres i Supabase.
*   [ ] Glycogen Debt Clock reagerer på aktive kalorier hentet fra HealthKit.
*   [ ] CNS-indikatoren viser "Empirical Data Active" når HRV-data er tilgjengelig.
