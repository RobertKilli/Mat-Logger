---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
inputDocuments: [proposal.md, docs/planning-artifacts/architecture.md]
documentCounts: {briefs: 1, research: 0, brainstorming: 0, projectDocs: 1}
classification:
  projectType: web_app
  domain: health_fitness
  complexity: medium
  projectContext: brownfield
releaseMode: single-release
workflowType: 'prd'
status: complete
completedAt: 'fredag 15. mai 2026'
---

# Product Requirements Document - Mat-Logger

**Author:** Robert
**Date:** fredag 15. mai 2026

## Executive Summary
Mat-Logger er en helhetlig ernærings- og treningsapplikasjon designet for brukere som krever dypere fysiologisk innsikt enn standard kaloritelling. Systemet oversetter komplekse biometriske signaler til håndterbare data for å løse problemet med overtrening og feilernæring. Målguppen er seriøse treningsentusiaster som ønsker å optimere ytelse ved å "lytte til kroppen".

### Hva gjør dette prosjektet unikt?
Det som skiller Mat-Logger fra alternativer som MyFitnessPal, er fokuset på sanntids fysiologisk beredskap. Kjerneinnsikten er at effektiv fremgang krever balanse mellom metabolsk belastning (glykemi) og nevrologisk belastning (CNS-tretthet). Gjennom "CNS Fatigue Indicator" og "Glycogen Debt Clock" får brukeren innsikt i sin faktiske restitusjonstilstand, støttet av en kompromissløs "Gram-Only" inntastingsmodell for maksimal dataintegritet.

## Prosjektklassifisering
- **Prosjekttype:** Webapplikasjon (Next.js/Supabase)
- **Domene:** Helse og trening (Vitenskapelig/Beregningstung)
- **Kompleksitet:** Middels (Sanntids metabolsk modellering)
- **Prosjektkontekst:** Brownfield (Bygger på eksisterende arkitektur)

## Suksesskriterier
### Brukersuksess
- **Aha-opplevelse:** Brukeren justerer dagens trening basert på fysiologiske indikatorer (Glycogen/CNS).
- **Datatillit:** Matlogging føles sømløs og nøyaktig gjennom "Gram-Only"-modellen.
### Forretningsmessig suksess
- Mat-Logger etablerer seg som et pålitelig "Body Cockpit" for daglig ytelsesoptimalisering.
### Teknisk suksess
- **Logikkdekning:** 100% testdekning for metabolsk logikk før UI-utvikling.
- **Responstid:** Sanntidsoppdatering av Cockpit med under 200ms forsinkelse.
- **Dataintegritet:** Full integritet gjennom Prisma og Supabase RLS.

## Prosjektavgrensning og Omfang
### Strategi: Single Release
Vi leverer den komplette "Body Cockpit"-opplevelsen fra dag én. Dette inkluderer både den nøyaktige loggingsmotoren og de avanserte fysiologiske indikatorene.

### Must-Have Funksjonalitet
- **Loggingsmotor:** Gram-basert inntasting med automatiske makro-beregninger.
- **Body Cockpit:** Sanntidsmålere for Glycogen Debt Clock og CNS Fatigue Indicator.
- **Bibliotek:** "Fork & Nudge"-funksjonalitet for lynrask tilpasning av matvarer.
- **Personalisering:** Sporing av kroppsvekt og daglig proteinmål.
- **Treningskategorier:** Logging av Push/Pull/Legs med ulik CNS-belastning.

### Risikohåndtering
- **Validering:** Grundig testing av "Metabolic Motor"-formlene mot subjektiv feedback.
- **Resiliens:** Local-first arkitektur sikrer funksjonalitet i gymmet uten internett.

## Brukerreiser
### Reise 1: Morgen-sjekk i Cockpiten (Suksessvei)
Robert våkner og sjekker "Glycogen Debt Clock". Han ser behovet for mer karbohydrater og logger en presis frokost. Dette gir ham grønt lys for en planlagt tung styrkeøkt.
### Reise 2: "Lytt til kroppen"-valget (Restitusjon)
Brukeren er klar for trening, men ser at CNS-indikatoren er i rød sone. Han pivoterer til en lett restitusjonsøkt basert på dataene, noe som forebygger utbrenthet.
### Reise 3: "Fork & Nudge" i biblioteket (Effektivitet)
Brukeren kjøper en ny matvare og lager raskt en personlig variant ved å "forke" en eksisterende vare og justere makroene på sekunder.

## Domenespesifikke Krav
### Compliance & Regulatory
- **GDPR:** Brukeren skal kunne eksportere alle data (JSON/CSV) og slette kontoen permanent.
### Tekniske Begrensninger
- **Formelversjonering:** Systemet skal lagre hvilken modellversjon som ble brukt for beregninger for å sikre historisk nøyaktighet.

## Innovasjon og nye mønstre
### Prediktiv fysiologisk modell
Appen utfordrer "hard work is always good"-myten ved å prioritere nevrologisk og metabolsk beredskap over rent volum.
### Fysiologisk Feedback-loop
Systemet ber om subjektiv bekreftelse på energinivå for å kalibrere de underliggende modellene kontinuerlig.

## Webapplikasjon Spesifikke Krav
### Responsivt Design
Grensesnittet skal være optimalisert for både mobil (bruk i gymmet) og desktop (analyse).
### Sanntid (As-you-go)
Bruk av optimistiske UI-oppdateringer for umiddelbar respons i "Body Cockpit" ved inntasting.
### Tilgjengelighet
Full overholdelse av WCAG 2.1 AA-standarden.

## Funksjonelle Krav

### Brukerhåndtering & Personalisering
- **FR1:** Brukeren kan opprette og administrere en profil.
- **FR2:** Brukeren kan registrere og oppdatere sin nåværende kroppsvekt.
- **FR3:** Brukeren kan definere et standard daglig proteinmål.
- **FR4:** Brukeren kan eksportere alle egne data i et maskinlesbart format (JSON/CSV).
- **FR5:** Brukeren kan slette sin konto og alle tilhørende data permanent.

### Matloggingsmotor
- **FR6:** Brukeren kan loggføre matvarer ved å oppgi nøyaktig vekt i gram.
- **FR7:** Systemet skal automatisk beregne makronæringsstoffer og kalorier basert på vekt og næringsinnhold per 100g.
- **FR8:** Brukeren kan se en sanntidsoppsummering av dagens totale inntak.
- **FR9:** Systemet skal håndtere inntasting av matvarenavn og næringsverdier per 100g for nye varer.

### Matbibliotek & Forvaltning
- **FR10:** Brukeren kan søke etter og velge matvarer fra et bibliotek.
- **FR11:** Brukeren kan kopiere ("Fork") en eksisterende matvare for å lage en personlig variant.
- **FR12:** Brukeren kan justere ("Nudge") verdier på en kopiert matvare før lagring.

### Treningslogging
- **FR13:** Brukeren kan loggføre treningsøkter kategorisert som "Push", "Pull" eller "Legs".
- **FR14:** Brukeren kan registrere intensitetsnivå for hver økt.
- **FR15:** Brukeren kan se historikk over tidligere treningsøkter.

### Body Cockpit & Analyse
- **FR16:** Systemet skal visualisere "Glycogen Debt Clock" basert på karbohydratinntak og tid.
- **FR17:** Systemet skal visualisere "CNS Fatigue Indicator" basert på treningshistorikk og intensitet.
- **FR18:** Systemet skal gi prediktive indikasjoner på fysiologisk beredskap.
- **FR19:** Brukeren kan gi subjektiv feedback på energinivå for kalibrering.

### System & Synkronisering
- **FR20:** Systemet skal støtte optimistiske grensesnittoppdateringer ("as-you-go").
- **FR21:** Systemet skal kunne oppdatere lokale indikatorer uten internett (Local-first).
- **FR22:** Systemet skal synkronisere lokale endringer til server når nettet er tilbake.
- **FR23:** Systemet skal lagre modellversjonen brukt for hver beregning.

## Ikke-Funksjonelle Krav

### Ytelse (Performance)
- **Sanntidsrespons:** Indikatorer skal oppdateres < 200ms etter inntasting.
- **Lastetid:** LCP skal være under 1 sekund.

### Sikkerhet og Personvern (Security)
- **Datatilgang:** All helsedata beskyttes med Supabase RLS.
- **Autentisering:** Sikker JWT-autentisering via Supabase Auth.

### Pålitelighet og Robusthet (Reliability)
- **Gym-resiliens:** Local-first arkitektur sikrer at Cockpit fungerer uavhengig av nettverksforhold i gymmet.
