# Artifact 1-7: Samsung Health & Health Connect Integrasjon

**Status:** Planned
**Role:** Cross-platform Empirical Biometrics

## 1. Målsetning
Utvide BODY COCKPIT OS til å støtte Android-brukere (Samsung/Pixel) ved å integrere Google Health Connect. Samsung Health synkroniserer data til Health Connect, som fungerer som den sentrale hub-en på Android.

## 2. Tekniske Komponenter

### A. Capacitor Health Connect Plugin
*   **Modul:** `@capacitor-community/health-connect` (eller tilsvarende stabil bro).
*   **Funksjon:** Lese data fra Android Health Connect API.
*   **Data-typer:** 
    *   `HeartRateVariability`
    *   `RestingHeartRate`
    *   `SleepSession`
    *   `ActiveCaloriesBurned`
    *   `Steps`

### B. Unified Health Provider Layer (`src/lib/biometry/provider.ts`)
*   Abstraksjonslag som detekterer plattform (iOS vs Android).
*   Standardiserer output fra HealthKit og Health Connect til systemets interne `BiometricRecord`-format.
*   Håndterer plattform-spesifikke tillatelser (Permissions).

### C. Android Background Sync
*   Bruk av Capacitor `BackgroundRunner` eller `WorkManager` (via native bridge) for periodisk polling av biometri.
*   Spesiell håndtering av Samsung Healths synkroniserings-intervaller til Health Connect.

## 3. Brukeropplevelse (UX)
*   **Platform Detection:** Viser "Link Samsung Health" eller "Link Apple Health" avhengig av enhet.
*   **Onboarding:** Steg-for-steg guide for å aktivere Health Connect-skriving i Samsung Health-appen.
*   **Unified Cockpit:** Indikatorene i dashbordet fungerer identisk uavhengig av kilde.

## 4. Sikkerhet og Personvern
*   **Scopes:** Ber kun om `READ`-tilgang til nødvendige felt.
*   **Compliance:** Følger Google Plays policy for helsedata-tilgang.
*   **Encryption:** Data som caches lokalt krypteres før synkronisering til Supabase.

## 5. Akseptansekriterier
*   [ ] Android-versjonen av appen kan be om tillatelse til Health Connect.
*   [ ] Data fra Samsung Health (via Health Connect) flyter inn i `BiometricRecord`-tabellen.
*   [ ] Cockpit-målere oppdateres basert på Android-biometri.
*   [ ] Systemet håndterer fravær av Health Connect-app på eldre Android-enheter med grasiøs fallback til simulering.
