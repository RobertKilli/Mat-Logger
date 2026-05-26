'use server'

import { prisma } from '@/lib/prisma'
import { FoodCategory } from '@prisma/client'

export async function fetchProductByBarcode(barcode: string) {
  try {
    // 1. Check local DB first
    const existingItem = await prisma.foodItem.findFirst({
      where: { barcode }
    })

    if (existingItem) {
      return { data: existingItem, source: 'DATABASE' }
    }

    // 2. Fetch from Open Food Facts
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
      headers: {
        'User-Agent': 'Mat-Logger - Web - Version 2.0'
      }
    })
    const json = await res.json()

    if (json.status === 0 || !json.product) {
      return { error: 'Produkt ikke funnet i Open Food Facts' }
    }

    const p = json.product
    const nut = p.nutriments

    // 3. Map to our FoodItem structure
    const newItem = {
      name: p.product_name || 'Ukjent produkt',
      brand: p.brands || null,
      barcode: barcode,
      source: 'OPEN_FOOD_FACTS',
      image_url: p.image_url || null,
      proteinPer100g: nut.proteins_100g || 0,
      carbsPer100g: nut.carbohydrates_100g || 0,
      fatPer100g: nut.fat_100g || 0,
      caloriesPer100g: nut['energy-kcal_100g'] || (nut.energy_100g ? nut.energy_100g / 4.184 : 0),
      baseAmount: 100,
      baseUnit: 'GRAM' as const,
      category: 'OTHER' as FoodCategory // We could try to map this, but 'OTHER' is safer
    }

    // 4. Save to DB as a global item
    const saved = await prisma.foodItem.create({
      data: newItem
    })

    return { data: saved, source: 'OPEN_FOOD_FACTS' }
  } catch (e) {
    console.error('Barcode fetch error:', e)
    return { error: 'Feil ved henting av produktdata' }
  }
}
