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
 * 
 * Rules:
 * - GRAMS: calculatedGrams = inputAmount
 * - UNITS: calculatedGrams = inputAmount * gramsPerUnit
 * - factor = calculatedGrams / foodItem.baseAmount
 * - macro = foodItem.macro * factor
 */
export function calculateNutrition(
  foodItem: Pick<FoodItem, 'baseAmount' | 'gramsPerUnit' | 'protein' | 'carbs' | 'fat' | 'calories'>,
  inputMode: InputMode,
  inputAmount: number
): CalculatedNutrition {
  if (inputAmount <= 0) {
    throw new Error('Input amount must be greater than zero')
  }

  let calculatedGrams = 0

  if (inputMode === 'GRAMS') {
    calculatedGrams = inputAmount
  } else if (inputMode === 'UNITS') {
    if (foodItem.gramsPerUnit == null || foodItem.gramsPerUnit <= 0) {
      throw new Error(`Cannot calculate by UNITS. 'gramsPerUnit' is missing or invalid for this food item.`)
    }
    calculatedGrams = inputAmount * foodItem.gramsPerUnit
  } else {
    throw new Error(`Invalid inputMode: ${inputMode}`)
  }

  // Calculate the scaling factor relative to the base amount (default is usually 100g)
  const factor = calculatedGrams / foodItem.baseAmount

  return {
    calculatedGrams: Number(calculatedGrams.toFixed(1)),
    calculatedProtein: Number((foodItem.protein * factor).toFixed(1)),
    calculatedCarbs: Number((foodItem.carbs * factor).toFixed(1)),
    calculatedFat: Number((foodItem.fat * factor).toFixed(1)),
    calculatedCalories: Math.round(foodItem.calories * factor)
  }
}
