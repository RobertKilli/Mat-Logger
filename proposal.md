# Proposal: Daily Nutrition & Training Logger

Jeg ønsker å bygge en enkel app for å loggføre daglig næringsinntak og treningsøkter.

## Hovedmål

Appen skal hjelpe meg med å følge med på:

- Matinntak per dag
- Mengde mat oppgitt i gram
- Protein
- Karbohydrater
- Fett
- Kalorier
- Totale kalorier for dagen
- Treningsøkter kategorisert som:
  - Push
  - Pull
  - Legs

## Funksjoner

### 1. Daglig matlogging

Brukeren skal kunne legge inn matvarer med:

- Navn på matvare
- Mengde i gram
- Protein per 100g
- Karbohydrater per 100g
- Fett per 100g
- Kalorier per 100g

Appen skal automatisk regne ut næringsinnhold basert på gram.

Eksempel:

Hvis jeg legger inn:

- Kyllingfilet
- 200 gram
- 23g protein per 100g
- 0g karbs per 100g
- 2g fett per 100g
- 110 kcal per 100g

Skal appen regne ut:

- 46g protein
- 0g karbs
- 4g fett
- 220 kcal

### 2. Daglig total

Appen skal vise totalsum for dagen:

- Total protein
- Total karbohydrater
- Total fett
- Total kalorier

Eksempelvis:

```text
Dagens total:
Protein: 185g
Karbohydrater: 260g
Fett: 75g
Kalorier: 2450 kcal