import { FoodCategory } from '@prisma/client'

export interface ExternalFoodItem {
  id: string
  name: string
  brand?: string
  image_url?: string
  unit_weight?: number
  protein_100g: number
  carbs_100g: number
  fat_100g: number
  calories_100g: number
  category: FoodCategory
  source: 'OFF' // Open Food Facts
}

/**
 * Maps Open Food Facts categories to our internal enum
 */
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

export async function searchExternalFood(query: string, preferNorwegian: boolean = true): Promise<ExternalFoodItem[]> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

  try {
    const baseUrl = preferNorwegian ? 'https://no.openfoodfacts.org' : 'https://world.openfoodfacts.org'
    
    // We request serving_quantity and product_quantity to guess unit weight
    const fields = 'code,product_name,product_name_no,brands,image_url,nutriments,categories_hierarchy,serving_quantity,product_quantity'
    const url = `${baseUrl}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=${fields}`
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mat-Logger - Web - 1.0 (https://github.com/robert/mat-logger)'
      }
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`External API (OFF) responded with status: ${response.status} for query: ${query}`)
      return []
    }
    
    const data = await response.json()
    
    return (data.products || []).map((p: any) => {
      const nutriments = p.nutriments || {}
      
      // Heuristic for unit weight: check serving_quantity (often used for single items like eggs/bars)
      let unitWeight = p.serving_quantity ? Number(p.serving_quantity) : undefined
      
      // Special case: if it's very large (e.g. a 500g pack), don't treat it as a single unit unless specifically noted
      if (unitWeight && unitWeight > 250) unitWeight = undefined 

      return {
        id: `off-${p.code}`,
        name: p.product_name_no || p.product_name || 'Ukjent produkt',
        brand: p.brands,
        image_url: p.image_url,
        unit_weight: unitWeight,
        protein_100g: Number(nutriments.proteins_100g || 0),
        carbs_100g: Number(nutriments.carbohydrates_100g || 0),
        fat_100g: Number(nutriments.fat_100g || 0),
        calories_100g: Math.round(Number(nutriments['energy-kcal_100g'] || 0)),
        category: mapOFFCategory(p.categories_hierarchy || []),
        source: 'OFF' as const
      }
    })
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
