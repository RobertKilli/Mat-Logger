# Mat-Logger Upgrade Plan (Status: Phase 2 Active)

## Project Goal
Mat-Logger skal oppgraderes fra en enkel mat- og treningslogger til en mer komplett fitness-app for styrketrening, makrotracking og progresjon.

---

## Current Status (v2.0)
- [x] **Full i18n Core:** Infrastruktur for Norsk/Engelsk på plass.
- [x] **Progress Center:** Vekt-grafer, 1RM-trender og volum-tracking operative.
- [x] **Extended Training:** Støtte for øvelser, rutiner og AI-visuals.
- [x] **Smart Nutrition:** Måltidsmaler, strekkodeskanning og nylig brukte varer.
- [x] **Consistency Protocol:** Poengsum for disiplin og dagsform-bilder (v2.0).

---

## Main Roadmap

### 1. Nutrition Logging (MacroFactor-style)
- [x] **Måltids-templates:** Grupper matvarer til faste måltider.
- [x] **Skanne strekkoder:** Integrert med Open Food Facts (v2.0).
- [x] **Recent Items:** Smart-liste med de 10 mest brukte matvarene (v2.0).

### 2. Workout Logging (Hevy-style)
- [x] **Trenings-rutiner:** Lagre faste økter som maler.
- [x] **AI-Demo Generator:** Automatisk generering av teknikk-bilder med DALL-E 3 (v2.0).
- [x] **Volume Tracking:** Automatisk kalkulering av totalt volum per økt.
- [x] **1RM Estimates:** Beregne estimert styrkeutvikling i grafene.

### 3. Visual & Analytics Center
- [x] **Styrke-grafer:** Visualisering av 1RM og volum over tid.
- [x] **Consistency Score:** Oversikt over dager man har truffet makro-målene (v2.0).
- [x] **Photo Log:** Mulighet til å logge dagsform-bilder til progresjonsfanen (v2.0).

---

## Tech Stack Expansion
- **i18n:** `src/lib/i18n` (Custom implementation)
- **AI:** OpenAI DALL-E 3 & GPT-4o (Visuals & Guidance).
- **Scanner:** `html5-qrcode` med Open Food Facts API.

---

## Core Positioning
Mat-Logger er en cyberpunk-inspirert "Body Cockpit" for seriøs styrketrening.
