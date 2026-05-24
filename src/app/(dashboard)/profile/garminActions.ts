'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { BiometricLog } from '@prisma/client'

export async function getGarminStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  try {
    const integration = await prisma.integration.findUnique({
      where: {
        user_id_provider: {
          user_id: user.id,
          provider: 'GARMIN'
        }
      }
    })

    return { connected: !!integration, lastSynced: integration?.last_synced }
  } catch {
    return { connected: false }
  }
}

export async function connectGarmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  try {
    await prisma.integration.upsert({
      where: {
        user_id_provider: {
          user_id: user.id,
          provider: 'GARMIN'
        }
      },
      update: {
        last_synced: new Date(),
        access_token: 'simulated_token',
      },
      create: {
        user_id: user.id,
        provider: 'GARMIN',
        access_token: 'simulated_token',
        last_synced: new Date(),
      }
    })

    // Seed some initial simulated Garmin data
    await prisma.biometricLog.createMany({
      data: [
        { user_id: user.id, type: 'RESTING_HR', value: 58, source: 'GARMIN_FENIX' },
        { user_id: user.id, type: 'SLEEP_SCORE', value: 85, source: 'GARMIN_FENIX' },
        { user_id: user.id, type: 'STRESS_LEVEL', value: 22, source: 'GARMIN_FENIX' },
        { user_id: user.id, type: 'BODY_BATTERY', value: 92, source: 'GARMIN_FENIX' },
      ]
    })

    revalidatePath('/profile')
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    console.error('Garmin connection error:', e)
    return { error: 'Failed to link Garmin account' }
  }
}

export async function disconnectGarmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  try {
    await prisma.integration.delete({
      where: {
        user_id_provider: {
          user_id: user.id,
          provider: 'GARMIN'
        }
      }
    })
    revalidatePath('/profile')
    return { success: true }
  } catch (e) {
    return { error: 'Failed to disconnect' }
  }
}

export async function getLatestBiometrics(): Promise<{ data?: BiometricLog[], error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  try {
    const types = ['RESTING_HR', 'SLEEP_SCORE', 'STRESS_LEVEL', 'BODY_BATTERY']
    
    const latestLogs = await Promise.all(
      types.map(type => 
        prisma.biometricLog.findFirst({
          where: { user_id: user.id, type },
          orderBy: { logged_at: 'desc' }
        })
      )
    )

    // Narrow type to remove nulls explicitly for TS
    const filteredLogs = latestLogs.filter((log): log is BiometricLog => log !== null)

    return { data: filteredLogs }
  } catch {
    return { data: [] }
  }
}
