import { PrismaClient } from '@prisma/client'

/**
 * BODY_COCKPIT_PRISMA_HANDLER
 * 
 * This module is hardened to prevent the entire application from crashing
 * due to malformed environment variables in Windows environments.
 */

let prismaInstance: PrismaClient | null = null

export function getSafePrisma() {
  // If we already detected a broken state, don't even try
  if (globalThis.PRISMA_FAILSAFE_ACTIVE) return null

  try {
    // Check if the URL is even present and looks like a URL
    const url = process.env.DATABASE_URL
    if (!url || !url.startsWith('postgresql')) {
      throw new Error('MISSING_OR_INVALID_URL')
    }

    if (!prismaInstance) {
      prismaInstance = new PrismaClient({
        log: ['error'],
      })
    }
    return prismaInstance
  } catch (err) {
    console.warn('!!! FAILSAFE ACTIVATED: Database connection is broken. Switching to Simulation Mode. !!!')
    globalThis.PRISMA_FAILSAFE_ACTIVE = true
    return null
  }
}

// Global flag to track system health across requests
declare global {
  var PRISMA_FAILSAFE_ACTIVE: boolean | undefined
}

// Default export as a dummy object to satisfy existing imports, 
// but we'll use getSafePrisma() for real logic.
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const p = getSafePrisma()
    if (!p) throw new Error('PRISMA_OFFLINE')
    return (p as any)[prop]
  }
})

export const hasValidDbUrl = !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql')
