import { InputMode, FoodItem } from '@prisma/client'

export interface CalculatedNutrition {
  calculatedGrams: number
  calculatedProtein: number
  calculatedCarbs: number
  calculatedFat: number
  calculatedCalories: number
}

/**
 * Calculates total nutritional values based on input mode and amount.
 * Follows the formula provided by the user.
 * 
 * factor = calculatedGrams / baseAmount
 * macro = macroPer100g * factor
 */
export function calculateFoodLogNutrition(
  foodItem: Pick<FoodItem, 'baseAmount' | 'gramsPerUnit' | 'servingSize' | 'proteinPer100g' | 'carbsPer100g' | 'fatPer100g' | 'caloriesPer100g'>,
  inputMode: InputMode,
  inputAmount: number
): CalculatedNutrition {
  if (inputAmount <= 0) {
    throw new Error('Mengde må være større enn null')
  }

  let calculatedGrams = 0

  if (inputMode === 'GRAMS') {
    calculatedGrams = inputAmount
  } else if (inputMode === 'UNITS') {
    if (foodItem.gramsPerUnit == null || foodItem.gramsPerUnit <= 0) {
      throw new Error(`Kan ikke beregne basert på ANTALL. Stykkvekt mangler for denne matvaren.`)
    }
    calculatedGrams = inputAmount * foodItem.gramsPerUnit
  } else if (inputMode === 'SERVING') {
    if (foodItem.servingSize == null || foodItem.servingSize <= 0) {
      throw new Error(`Kan ikke beregne basert på PORSJON. Porsjonsstørrelse mangler for denne matvaren.`)
    }
    calculatedGrams = inputAmount * foodItem.servingSize
  } else {
    throw new Error(`Ugyldig inntaksmodus: ${inputMode}`)
  }

  // Factor relative to the nutrition basis (usually 100g)
  const factor = calculatedGrams / (foodItem.baseAmount || 100)

  return {
    calculatedGrams: Number(calculatedGrams.toFixed(1)),
    calculatedProtein: Number((foodItem.proteinPer100g * factor).toFixed(2)),
    calculatedCarbs: Number((foodItem.carbsPer100g * factor).toFixed(2)),
    calculatedFat: Number((foodItem.fatPer100g * factor).toFixed(2)),
    calculatedCalories: Math.round(foodItem.caloriesPer100g * factor)
  }
}

// Keep the old function name as an alias if needed by other components during transition
export const calculateNutrition = calculateFoodLogNutrition;
