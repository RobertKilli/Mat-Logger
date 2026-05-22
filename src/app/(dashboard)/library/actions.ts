'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { searchExternalFood } from '@/lib/metabolism/externalSearch'
import { FoodCategory } from '@prisma/client'

export async function searchFoodItems(query: string, options: { preferNorwegian?: boolean, includeExternal?: boolean } = {}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    // 1. Search internal DB
    const internalItems = await prisma.foodItem.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
        OR: [
          { user_id: null }, // Global items
          { user_id: user.id }, // My personal items
        ],
      },
      orderBy: [
        {
          user_id: 'desc',
        },
        { name: 'asc' },
      ],
    })

    // 2. Search External (OFF) if requested
    let externalItems: any[] = []
    if (options.includeExternal) {
      externalItems = await searchExternalFood(query, options.preferNorwegian ?? true)
    }

    return { 
      data: {
        internal: internalItems,
        external: externalItems
      }
    }
  } catch (e) {
    console.error('Search error:', e)
    return { error: 'Search failed' }
  }
}

export async function addFoodItem(data: {
  name: string
  category: FoodCategory
  image_url?: string
  unit_weight?: number
  protein_100g: number
  carbs_100g: number
  fat_100g: number
  calories_100g: number
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const item = await prisma.foodItem.create({
      data: {
        ...data,
        user_id: user.id,
      }
    })

    revalidatePath('/library')
    return { data: item }
  } catch (e) {
    console.error('Add food error:', e)
    return { error: 'Failed to create food item' }
  }
}

export async function forkFoodItem(
  originalItemId: string,
  updates: {
    name: string
    category?: FoodCategory
    image_url?: string
    unit_weight?: number
    protein: number
    carbs: number
    fat: number
    calories: number
  }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const newItem = await prisma.foodItem.create({
      data: {
        user_id: user.id,
        name: updates.name,
        category: updates.category ?? 'OTHER',
        image_url: updates.image_url,
        unit_weight: updates.unit_weight,
        protein_100g: updates.protein,
        carbs_100g: updates.carbs,
        fat_100g: updates.fat,
        calories_100g: updates.calories,
      },
    })

    revalidatePath('/library')
    return { data: newItem }
  } catch (e) {
    console.error('Fork error:', e)
    return { error: 'Failed to create personal variant' }
  }
}

export async function deleteFoodItem(itemId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Only allow deleting personal items
    await prisma.foodItem.delete({
      where: {
        id: itemId,
        user_id: user.id
      }
    })

    revalidatePath('/library')
    return { success: true }
  } catch (e) {
    console.error('Delete food item error:', e)
    return { error: 'Kunne ikke slette matvaren. Globale varer kan ikke fjernes.' }
  }
}

export async function getCategorizedLibrary() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Fetch items that the user has actually logged (used) + their personal items
    const usedItems = await prisma.foodItem.findMany({
      where: {
        OR: [
          { user_id: user.id },
          { 
            food_logs: {
              some: { user_id: user.id }
            }
          }
        ]
      },
      orderBy: { name: 'asc' }
    })

    // Group by category
    const categorized = usedItems.reduce((acc, item) => {
      const cat = item.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, typeof usedItems>)

    return { data: categorized }
  } catch (e) {
    console.error('Library fetch error:', e)
    return { error: 'Failed to fetch categorized library' }
  }
}
