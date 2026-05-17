/**
 * Calculates absolute macro values based on weight and values per 100g.
 * Formula: (ValuePer100g / 100) * Grams
 */
export function calculateScaledMacros(
  grams: number,
  per100g: {
    protein: number
    carbs: number
    fat: number
    calories: number
  }
) {
  const scale = grams / 100

  return {
    protein: Number((per100g.protein * scale).toFixed(1)),
    carbs: Number((per100g.carbs * scale).toFixed(1)),
    fat: Number((per100g.fat * scale).toFixed(1)),
    calories: Math.round(per100g.calories * scale),
  }
}
