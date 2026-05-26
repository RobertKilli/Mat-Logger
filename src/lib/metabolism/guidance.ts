import { BiometricLog, FoodLog, WorkoutLog } from '@prisma/client'

export interface MissionBriefing {
  type: 'OPTIMAL' | 'CAUTION' | 'REST' | 'FUEL'
  title: string
  message: string
  actionItem?: string
}

/**
 * Analyzes telemetry and intake to generate clinical performance briefings.
 */
export function generateGuidance(
  biometrics: BiometricLog[],
  nutrition: { protein: number, carbs: number, fat: number, calories: number, goal: number },
  recentWorkouts: WorkoutSummary[]
): MissionBriefing {
  
  // Extract primary telemetry
  const sleep = biometrics.find(b => b.type === 'SLEEP_SCORE')?.value || 0
  const stress = biometrics.find(b => b.type === 'STRESS_LEVEL')?.value || 0
  const battery = biometrics.find(b => b.type === 'BODY_BATTERY')?.value || 0

  // 1. Critical Recovery Analysis
  if (sleep < 55 || battery < 30) {
    return {
      type: 'REST',
      title: 'RECOVERY_DEFICIT',
      message: 'Systemisk utmattelse detektert. Biometrisk status tilsier kritisk lav restitusjonsevne.',
      actionItem: 'Deaktiver planlagt trening. Prioriter 120min søvn-overskudd.'
    }
  }

  // 2. High CNS Load Analysis
  if (stress > 65) {
    return {
      type: 'CAUTION',
      title: 'ELEVATED_CNS_STRESS',
      message: 'Sentralnervesystemet rapporterer forhøyet belastning. Nevromuskulær effektivitet er redusert.',
      actionItem: 'Unngå maksimale belastninger (>85% 1RM). Utfør lavintensitets-bevegelse.'
    }
  }

  // 3. Anabolic Support Analysis
  if (nutrition.protein < nutrition.goal * 0.6 && nutrition.goal > 0) {
     return {
        type: 'FUEL',
        title: 'ANABOLIC_INSUFFICIENCY',
        message: 'Aminosyre-tilgjengelighet utilstrekkelig for muskulær reparasjon og proteinsyntese.',
        actionItem: 'Innta 40-50g protein umiddelbart for å stabilisere nitrogenbalansen.'
     }
  }

  // 4. Operational Readiness: HIGH
  if (sleep > 80 && battery > 70 && stress < 30) {
    return {
      type: 'OPTIMAL',
      title: 'SYSTEM_READY',
      message: 'Alle biometriske parametere er innenfor optimalt område. Systemet er klargjort for maksimal mekanisk belastning.',
      actionItem: 'Gjennomfør planlagt misjon. Sikt på progressiv overlast (1RM).'
    }
  }

  // Default Operational State
  return {
    type: 'CAUTION',
    title: 'STABLE_OPERATIONS',
    message: 'Systemet opererer innenfor normale parametere. Telemetri overvåkes kontinuerlig.',
    actionItem: 'Følg etablert treningsprotokoll.'
  }
}

interface WorkoutSummary {
  intensity: number
  logged_at: Date
}
