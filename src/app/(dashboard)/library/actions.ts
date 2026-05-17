'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function searchFoodItems(query: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const items = await prisma.foodItem.findMany({
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

    return { data: items }
  } catch (e) {
    console.error('Search error:', e)
    return { error: 'Search failed' }
  }
}

export async function forkFoodItem(
  originalItemId: string,
  updates: {
    name: string
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
