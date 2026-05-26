# Mat-Logger Upgrade Plan (Status: Phase 1 Active)

## Project Goal
Mat-Logger skal oppgraderes fra en enkel mat- og treningslogger til en mer komplett fitness-app for styrketrening, makrotracking og progresjon.

---

## Current Status (v1.2)
- [x] **Full i18n Core:** Infrastruktur for Norsk/Engelsk på plass med `useI18n` hook.
- [x] **Progress Center:** Vekt-grafer og historisk vektlogging operative.
- [x] **Extended Training:** Støtte for øvelser, sett, reps og vekt i PPL-logger.
- [x] **Goal Management:** Bulk/Deff-strategier med automatiske kaloriforslag.
- [x] **Meal Templates:** Lagre og logg faste måltidskombinasjoner (v1.2).

---

## Main Roadmap

### 1. Nutrition Logging (MacroFactor-style)
- [x] **Måltids-templates:** Grupper matvarer til faste måltider (f.eks. "Standard Shake") for raskere logging.
- [ ] **Skanne strekkoder:** Utnytte Open Food Facts' strekkode-støtte.
- [ ] **Recent Items:** Smart-liste med de 10 mest brukte matvarene per måltidstype.

### 2. Workout Logging (Hevy-style)
- [ ] **Trenings-rutiner:** Lagre faste økter (f.eks. "Mandag Push") som maler.
- [ ] **AI-Demo Generator:** Automatisk generering av teknikk-bilder for biblioteket.
- [ ] **Volume Tracking:** Automatisk kalkulering av totalt volum per økt.
- [ ] **1RM Estimates:** Beregne estimert styrkeutvikling i grafene.

### 3. Visual & Analytics Center
- [ ] **Styrke-grafer:** Visualisering av 1RM og volum over tid.
- [ ] **Consistency Score:** Oversikt over dager man har truffet makro-målene.
- [ ] **Photo Log:** Mulighet til å laste opp dagsform-bilder til progresjonsfanen.

---

## Tech Stack Expansion
- **i18n:** `src/lib/i18n` (Custom implementation)
- **Charts:** SVG-Native (MVP) -> Moving to `Recharts` for complexity.
- **AI:** OpenAI DALL-E API (Planlagt for øvelsesbilder).

---

## Core Positioning
Mat-Logger skal være en fitness-first nutrition and workout tracker for folk som trener styrke.

Kort pitch:
> Mat-Logger er en mat- og treningsdagbok for deg som trener styrke.  
> Logg mat i gram, antall eller porsjoner, følg makroene dine, loggfør Push/Pull/Legs-økter og få visuelle øvelsesdemoer med AI-genererte instruktører.
