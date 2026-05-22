import { FoodCategory, BaseUnit } from '@prisma/client'

export interface ExternalFoodItem {
  id: string
  name: string
  brand?: string
  image_url?: string
  unit_weight?: number
  baseAmount: number
  baseUnit: BaseUnit
  protein: number
  carbs: number
  fat: number
  calories: number
  category: FoodCategory
  source: 'OFF' // Open Food Facts
}

/**
 * Heuristic to extract unit weight from various OFF fields
 */
function detectUnitWeight(p: any): number | undefined {
  // 1. Try explicit serving_quantity
  if (p.serving_quantity) {
    const val = Number(p.serving_quantity)
    if (val > 0 && val < 250) return val
  }

  // 2. Try parsing the quantity string (e.g. "6 x 60 g", "300g")
  const quantityStr = (p.quantity || '').toLowerCase()
  if (quantityStr) {
    // Look for "X x Y g" pattern
    const multiMatch = quantityStr.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*g/)
    if (multiMatch) return parseFloat(multiMatch[2])

    // If it's just "60g", and it's a known single-item type (like a bar), we could use it
    // But safely, we only use it if it's small
    const singleMatch = quantityStr.match(/^(\d+(?:\.\d+)?)\s*g$/)
    if (singleMatch) {
      const val = parseFloat(singleMatch[1])
      if (val > 0 && val < 100) return val
    }
  }
  
  // 3. Special case for Eggs (if name contains egg and no weight found)
  const name = (p.product_name_no || p.product_name || '').toLowerCase()
  if (name.includes('egg')) {
     return 60 // Standard medium egg
  }

  return undefined
}

function mapOFFCategory(categories: string[]): FoodCategory {
  const cats = categories.join(' ').toLowerCase()
  
  if (cats.includes('meat') || cats.includes('kjøtt') || cats.includes('skinke')) return 'MEAT'
  if (cats.includes('fish') || cats.includes('fisk') || cats.includes('seafood') || cats.includes('sjømat')) return 'FISH'
  if (cats.includes('fruit') || cats.includes('frukt')) return 'FRUIT'
  if (cats.includes('vegetable') || cats.includes('grønnsak')) return 'VEGETABLE'
  if (cats.includes('dairy') || cats.includes('meieri') || cats.includes('cheese') || cats.includes('milk') || cats.includes('ost') || cats.includes('melk') || cats.includes('yoghurt')) return 'DAIRY'
  if (cats.includes('grain') || cats.includes('bread') || cats.includes('brød') || cats.includes('cereal') || cats.includes('korn')) return 'GRAIN'
  if (cats.includes('supplement') || cats.includes('protein powder') || cats.includes('kosttilskudd')) return 'SUPPLEMENT'
  
  return 'OTHER'
}

function mapProduct(p: any): ExternalFoodItem {
  const nutriments = p.nutriments || {}
  return {
    id: `off-${p.code}`,
    name: p.product_name_no || p.product_name || 'Ukjent produkt',
    brand: p.brands,
    image_url: p.image_url,
    unit_weight: detectUnitWeight(p),
    baseAmount: 100,
    baseUnit: 'GRAM',
    protein: Number(nutriments.proteins_100g || 0),
    carbs: Number(nutriments.carbohydrates_100g || 0),
    fat: Number(nutriments.fat_100g || 0),
    calories: Math.round(Number(nutriments['energy-kcal_100g'] || 0)),
    category: mapOFFCategory(p.categories_hierarchy || []),
    source: 'OFF'
  }
}

export async function fetchExternalProduct(code: string): Promise<ExternalFoodItem | null> {
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${code}.json`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mat-Logger - Web - 1.0' }
    })
    if (!response.ok) return null
    const data = await response.json()
    if (!data.product) return null
    return mapProduct(data.product)
  } catch {
    return null
  }
}

async function fetchOFF(query: string, baseUrl: string, signal: AbortSignal): Promise<ExternalFoodItem[]> {
  const fields = 'code,product_name,product_name_no,brands,image_url,nutriments,categories_hierarchy,serving_quantity,product_quantity,quantity'
  const url = `${baseUrl}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=${fields}`
  
  const response = await fetch(url, {
    signal,
    headers: {
      'User-Agent': 'Mat-Logger - Web - 1.0 (https://github.com/robert/mat-logger)'
    }
  })
  
  if (!response.ok) {
    throw new Error(`OFF API error: ${response.status}`)
  }
  
  const data = await response.json()
  return (data.products || []).map(mapProduct)
}

export async function searchExternalFood(query: string, preferNorwegian: boolean = true): Promise<ExternalFoodItem[]> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const primaryBaseUrl = preferNorwegian ? 'https://no.openfoodfacts.org' : 'https://world.openfoodfacts.org'
    let results = await fetchOFF(query, primaryBaseUrl, controller.signal)
    
    if (results.length === 0 && preferNorwegian) {
      results = await fetchOFF(query, 'https://world.openfoodfacts.org', controller.signal)
    }
    
    return results
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn(`External search for "${query}" timed out.`)
    } else {
      console.error('External search error:', error)
    }
    return []
  } finally {
    clearTimeout(timeoutId)
  }
}
