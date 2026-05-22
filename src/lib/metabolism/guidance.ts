import { BiometricLog, FoodLog, WorkoutLog } from '@prisma/client'

export interface MissionBriefing {
  type: 'OPTIMAL' | 'CAUTION' | 'REST' | 'FUEL'
  title: string
  message: string
  actionItem?: string
}

/**
 * Analyzes telemetry and intake to generate actionable mission briefings.
 */
export function generateGuidance(
  biometrics: BiometricLog[],
  nutrition: { protein: number, carbs: number, fat: number, calories: number, goal: number },
  recentWorkouts: WorkoutSummary[]
): MissionBriefing {
  
  // Extract key metrics
  const sleep = biometrics.find(b => b.type === 'SLEEP_SCORE')?.value || 0
  const stress = biometrics.find(b => b.type === 'STRESS_LEVEL')?.value || 0
  const battery = biometrics.find(b => b.type === 'BODY_BATTERY')?.value || 0
  const hr = biometrics.find(b => b.type === 'RESTING_HR')?.value || 0

  // 1. Fatigue Analysis
  if (sleep < 60 || battery < 30) {
    return {
      type: 'REST',
      title: 'RESTITUSJON_PÅKREVD',
      message: 'Systematisk tretthet detektert. Din Body Battery er kritisk lav. Reduser treningsvolumet med 50% i dag.',
      actionItem: 'Prioriter 2 timer ekstra søvn i natt.'
    }
  }

  // 2. High Stress Analysis
  if (stress > 60) {
    return {
      type: 'CAUTION',
      title: 'HØYT_SYSTEMSTRESS',
      message: 'Fysiologisk stressnivå er forhøyet. Unngå maksløft eller høyintensitets-intervaller.',
      actionItem: 'Gjennomfør 15 minutter aktiv restitusjon (gåtur/tøying).'
    }
  }

  // 3. Nutrition/Fueling Analysis
  if (nutrition.protein < nutrition.goal * 0.5 && nutrition.goal > 0) {
     return {
        type: 'FUEL',
        title: 'DRIVSTOFF_MANKO',
        message: 'Proteinnivået ditt er for lavt til å støtte muskulær reparasjon etter forrige økt.',
        actionItem: 'Innta et måltid med minst 40g hurtigabsorberende protein nå.'
     }
  }

  // 4. Optimal State
  if (sleep > 80 && battery > 70) {
    return {
      type: 'OPTIMAL',
      title: 'KLAR_FOR_MISJON',
      message: 'Alle systemer er grønne. Kroppen din er i optimal tilstand for en tung styrkeøkt.',
      actionItem: 'Sikt mot en ny Personlig Rekord (PR) i dag!'
    }
  }

  // Default
  return {
    type: 'CAUTION',
    title: 'OPERASJONELL_MODUS',
    message: 'Fortsett daglig loggføring. Vi overvåker dine biometriske trender.',
    actionItem: 'Hold deg til din planlagte treningsøkt.'
  }
}

interface WorkoutSummary {
  intensity: number
  logged_at: Date
}
