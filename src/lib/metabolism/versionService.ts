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

  const activeVersion = await prisma.modelVersion.findFirst({
    where: { is_active: true },
    select: { id: true },
    orderBy: { created_at: 'desc' },
  })

  if (!activeVersion) {
    // Fallback if no active version is found, though seed should prevent this
    return 'v1.0-base'
  }

  activeVersionCache = activeVersion.id
  return activeVersionCache
}

/**
 * Clears the version cache (useful for admin updates).
 */
export function clearVersionCache() {
  activeVersionCache = null
}
