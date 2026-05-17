/**
 * CNS Fatigue & Neurological Recovery Logic
 * 
 * Model: Exponential Decay
 * Half-life: ~24 hours for resting recovery.
 * Intensity Impact: Higher intensity (1-10) adds more to the "fatigue debt".
 */

const RECOVERY_HALF_LIFE_HOURS = 24.0
const LAMBDA = Math.LN2 / RECOVERY_HALF_LIFE_HOURS
const MAX_SESSION_FATIGUE = 40.0 // % added for a 10/10 session

export interface CNSState {
  percentage: number // 0-100
  recoveryTimeHours: number
}

/**
 * Calculates current CNS fatigue based on logs and rest time.
 * @param logs List of recent workout logs (category, intensity, timestamp).
 * @param now Current date context.
 */
export function calculateCNSFatigue(
  logs: { intensity: number; logged_at: Date }[],
  now: Date = new Date()
): CNSState {
  let accumulatedFatigue = 0

  // Sort logs by time (oldest first)
  const sortedLogs = [...logs].sort(
    (a, b) => a.logged_at.getTime() - b.logged_at.getTime()
  )

  for (let i = 0; i < sortedLogs.length; i++) {
    const log = sortedLogs[i]
    const nextTime = sortedLogs[i + 1]?.logged_at ?? now
    
    // 1. Add fatigue from this session
    // Formula: (Intensity / 10) * MAX_SESSION_FATIGUE
    const sessionImpact = (log.intensity / 10) * MAX_SESSION_FATIGUE
    accumulatedFatigue += sessionImpact

    // 2. Decay fatigue until the next log or 'now'
    const hoursRest = (nextTime.getTime() - log.logged_at.getTime()) / (1000 * 60 * 60)
    accumulatedFatigue *= Math.exp(-LAMBDA * hoursRest)
  }

  // Cap at 100% and floor at 0%
  const finalPercentage = Math.min(100, Math.max(0, accumulatedFatigue))

  // Calculate time until "Optimal" (< 30%)
  // 30 = Current * e^(-LAMBDA * t)
  // ln(30/Current) = -LAMBDA * t
  // t = ln(Current/30) / LAMBDA
  let recoveryTimeHours = 0
  if (finalPercentage > 30) {
    recoveryTimeHours = Math.log(finalPercentage / 30) / LAMBDA
  }

  return {
    percentage: Math.round(finalPercentage),
    recoveryTimeHours: Number(recoveryTimeHours.toFixed(1)),
  }
}
