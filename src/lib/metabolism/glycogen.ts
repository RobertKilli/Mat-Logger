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
 * @param activeCalories Optional active calories burned (empirical signal).
 */
export function calculateGlycogenState(
  weight: number,
  totalCarbs: number,
  hoursPassed: number,
  activeCalories?: number
): GlycogenState {
  const maxGrams = weight * MAX_CAPACITY_FACTOR
  
  // 1. Basal Depletion
  let depletion = weight * BASAL_DEPLETION_RATE * hoursPassed

  // 2. Active Depletion (Empirical)
  // 1g of glycogen storage yields ~4 kcal of energy. 
  // We assume a mix of fuel sources, but for the "Debt Clock" we track the carb component.
  if (activeCalories && activeCalories > 0) {
    const carbEnergyFraction = 0.5 // Assume 50% energy comes from glycogen during activity
    const glycogenBurned = (activeCalories * carbEnergyFraction) / 4
    depletion += glycogenBurned
  }
  
  // Net balance: Added carbs minus total depletion
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
