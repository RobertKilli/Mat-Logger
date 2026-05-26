'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const weight = parseFloat(formData.get('weight') as string)
  const proteinGoal = parseInt(formData.get('proteinGoal') as string)

  if (isNaN(weight) || weight <= 0) {
    return { error: 'Invalid weight value' }
  }

  if (isNaN(proteinGoal) || proteinGoal < 0) {
    return { error: 'Invalid protein goal value' }
  }

  try {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email!,
        weight,
        protein_goal: proteinGoal,
      },
      update: {
        weight,
        protein_goal: proteinGoal,
      },
    })

    // Log weight history
    await prisma.weightLog.create({
      data: {
        user_id: user.id,
        weight
      }
    })

    revalidatePath('/profile')
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    console.error('Error updating profile:', e)
    return { error: 'Failed to update database' }
  }
}
