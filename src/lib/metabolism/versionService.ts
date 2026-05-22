import { prisma } from '@/lib/prisma'

let activeVersionCache: string | null = null

/**
 * Retrieves the current active metabolic model version ID.
 * Implements a simple cache to avoid redundant DB lookups.
 */
export async function getActiveModelVersion(): Promise<string> {
  if (activeVersionCache) {
    return activeVersionCache
  }

  try {
    let activeVersion = await prisma.modelVersion.findFirst({
      where: { is_active: true },
      select: { id: true },
      orderBy: { created_at: 'desc' },
    })

    // If no active version found, ensure the default exists and use it
    if (!activeVersion) {
      const defaultVersion = await prisma.modelVersion.upsert({
        where: { id: 'v1.0-base' },
        update: { is_active: true },
        create: {
          id: 'v1.0-base',
          version_name: 'v1.0-base',
          is_active: true,
        },
      })
      activeVersion = { id: defaultVersion.id }
    }

    activeVersionCache = activeVersion.id
    return activeVersionCache
  } catch (error) {
    console.error('Error fetching model version:', error)
    // Absolute fallback - should be avoided by the logic above
    return 'v1.0-base'
  }
}

/**
 * Clears the version cache (useful for admin updates).
 */
export function clearVersionCache() {
  activeVersionCache = null
}
