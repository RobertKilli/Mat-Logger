/**
 * Glycogen Depletion & Recovery Logic
 * 
 * Basal Depletion: ~0.1g per kg body weight per hour (resting).
 * Max Capacity: ~5g per kg body weight (average adult).
 */

const BASAL_DEPLETION_RATE = 0.1 // g/kg/hr
const MAX_CAPACITY_FACTOR = 5.0 // g/kg

export interface GlycogenState {
  currentGrams: number
  maxGrams: number
  percentage: number
}

/**
 * Calculates current glycogen state based on weight, logs, and time.
 * @param weight Current body weight in kg.
 * @param totalCarbs Consumed carbs (g) since "saturation" or last known state.
 * @param hoursPassed Time elapsed since the measurement period started.
 */
export function calculateGlycogenState(
  weight: number,
  totalCarbs: number,
  hoursPassed: number
): GlycogenState {
  const maxGrams = weight * MAX_CAPACITY_FACTOR
  
  // Start at 100% capacity for this MVP model, then subtract debt
  // In future versions, we should track state across days.
  const depletion = weight * BASAL_DEPLETION_RATE * hoursPassed
  
  // Net balance: Added carbs minus basal depletion
  // (Assuming 100% absorption for MVP)
  let currentGrams = maxGrams - depletion + totalCarbs
  
  // Cap at max capacity and floor at 0
  currentGrams = Math.min(maxGrams, Math.max(0, currentGrams))
  
  const percentage = (currentGrams / maxGrams) * 100

  return {
    currentGrams: Number(currentGrams.toFixed(1)),
    maxGrams: Number(maxGrams.toFixed(1)),
    percentage: Math.round(percentage),
  }
}
