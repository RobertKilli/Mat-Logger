# Mat-Logger Upgrade Plan (Status: Phase 3 Active)

## Project Goal
Mat-Logger skal oppgraderes fra en enkel mat- og treningslogger til en mer komplett fitness-app for styrketrening, makrotracking og progresjon.

---

## Current Status (v2.2 - Phase 3)
- [x] **Full i18n Core:** Infrastruktur for Norsk/Engelsk på plass.
- [x] **Progress Center:** Vekt-grafer, 1RM-trender og volum-tracking operative.
- [x] **Extended Training:** Støtte for øvelser, rutiner og AI-visuals.
- [x] **Smart Nutrition:** Måltidsmaler, strekkodeskanning og nylig brukte varer.
- [x] **Consistency Protocol:** Poengsum for disiplin og dagsform-bilder.
- [x] **Clinical OS:** BODY COCKPIT OS AI-protokoller og GPT-4o Briefing (v2.2).

---

## Main Roadmap

### 1. Nutrition Logging (MacroFactor-style)
- [x] **Måltids-templates:** Grupper matvarer til faste måltider.
- [x] **Skanne strekkoder:** Integrert med Open Food Facts.
- [x] **Recent Items:** Smart-liste med de 10 mest brukte matvarene.
- [ ] **Tactical Fueling:** Push-varsler for måltidsvinduer (v3.0).

### 2. Workout Logging (Hevy-style)
- [x] **Trenings-rutiner:** Lagre faste økter som maler.
- [x] **AI-Demo Generator:** Automatisk generering av teknikk-bilder med DALL-E 3.
- [x] **Volume Tracking:** Automatisk kalkulering av totalt volum per økt.
- [x] **Exercise Library:** Dedikert visuell database for alle øvelser (v2.2).

### 3. Visual & Analytics Center
- [x] **Styrke-grafer:** Visualisering av 1RM og volum over tid.
- [x] **Consistency Score:** Oversikt over dager man har truffet makro-målene.
- [x] **Photo Log:** Mulighet til å logge dagsform-bilder til progresjonsfanen.
- [ ] **PB Dashboard:** En "Wall of Fame" for alle dine tyngste løft (v3.0). (MVP operative i Progress Center).

---

## Tech Stack Expansion
- **i18n:** `src/lib/i18n` (Custom implementation)
- **AI:** OpenAI DALL-E 3 & GPT-4o (Visuals & Clinical OS).
- **Scanner:** `html5-qrcode` med Open Food Facts API.
- **PWA:** Service Workers for taktiske varsler (Planlagt).

---

## Core Positioning
Mat-Logger er en cyberpunk-inspirert "Body Cockpit" for seriøs styrketrening.

