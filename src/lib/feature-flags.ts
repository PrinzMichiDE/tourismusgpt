import prisma from './db';
import { createLogger } from './logger';

const logger = createLogger('feature-flags');

/**
 * Feature flag cache
 */
let flagCache: Map<string, { flag: FeatureFlag; cachedAt: number }> = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

interface FeatureFlag {
  key: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  enabledForRoles: string[] | null;
  enabledForUsers: string[] | null;
}

/**
 * Get feature flag from cache or database
 */
async function getFlag(key: string): Promise<FeatureFlag | null> {
  const cached = flagCache.get(key);
  
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return cached.flag;
  }
  
  const flag = await prisma.featureFlag.findUnique({
    where: { key },
  });
  
  if (flag) {
    flagCache.set(key, {
      flag: {
        key: flag.key,
        name: flag.name,
        description: flag.description,
        isEnabled: flag.isEnabled,
        enabledForRoles: flag.enabledForRoles as string[] | null,
        enabledForUsers: flag.enabledForUsers as string[] | null,
      },
      cachedAt: Date.now(),
    });
  }
  
  return flag ? {
    key: flag.key,
    name: flag.name,
    description: flag.description,
    isEnabled: flag.isEnabled,
    enabledForRoles: flag.enabledForRoles as string[] | null,
    enabledForUsers: flag.enabledForUsers as string[] | null,
  } : null;
}

/**
 * Check if a feature is enabled
 */
export async function isFeatureEnabled(
  key: string,
  context?: { userId?: string; role?: string }
): Promise<boolean> {
  const flag = await getFlag(key);
  
  if (!flag) {
    logger.warn({ key }, 'Feature flag not found');
    return false;
  }
  
  // Check global enabled status
  if (!flag.isEnabled) {
    return false;
  }
  
  // If no targeting, feature is globally enabled
  if (!flag.enabledForRoles && !flag.enabledForUsers) {
    return true;
  }
  
  // Check user targeting
  if (context?.userId && flag.enabledForUsers?.includes(context.userId)) {
    return true;
  }
  
  // Check role targeting
  if (context?.role && flag.enabledForRoles?.includes(context.role)) {
    return true;
  }
  
  // Not enabled for this context
  return false;
}

/**
 * Get all feature flags
 */
export async function getAllFlags(): Promise<FeatureFlag[]> {
  const flags = await prisma.featureFlag.findMany({
    orderBy: { key: 'asc' },
  });
  
  return flags.map(f => ({
    key: f.key,
    name: f.name,
    description: f.description,
    isEnabled: f.isEnabled,
    enabledForRoles: f.enabledForRoles as string[] | null,
    enabledForUsers: f.enabledForUsers as string[] | null,
  }));
}

/**
 * Update feature flag
 */
export async function updateFlag(
  key: string,
  updates: Partial<Omit<FeatureFlag, 'key'>>
): Promise<FeatureFlag | null> {
  const flag = await prisma.featureFlag.update({
    where: { key },
    data: {
      name: updates.name,
      description: updates.description,
      isEnabled: updates.isEnabled,
      enabledForRoles: updates.enabledForRoles ? JSON.parse(JSON.stringify(updates.enabledForRoles)) : undefined,
      enabledForUsers: updates.enabledForUsers ? JSON.parse(JSON.stringify(updates.enabledForUsers)) : undefined,
    },
  });
  
  // Invalidate cache
  flagCache.delete(key);
  
  logger.info({ key, updates }, 'Feature flag updated');
  
  return {
    key: flag.key,
    name: flag.name,
    description: flag.description,
    isEnabled: flag.isEnabled,
    enabledForRoles: flag.enabledForRoles as string[] | null,
    enabledForUsers: flag.enabledForUsers as string[] | null,
  };
}

/**
 * Create feature flag
 */
export async function createFlag(data: {
  key: string;
  name: string;
  description?: string;
  isEnabled?: boolean;
  enabledForRoles?: string[];
  enabledForUsers?: string[];
}): Promise<FeatureFlag> {
  const flag = await prisma.featureFlag.create({
    data: {
      key: data.key,
      name: data.name,
      description: data.description,
      isEnabled: data.isEnabled ?? false,
      enabledForRoles: data.enabledForRoles,
      enabledForUsers: data.enabledForUsers,
    },
  });
  
  logger.info({ key: data.key }, 'Feature flag created');
  
  return {
    key: flag.key,
    name: flag.name,
    description: flag.description,
    isEnabled: flag.isEnabled,
    enabledForRoles: flag.enabledForRoles as string[] | null,
    enabledForUsers: flag.enabledForUsers as string[] | null,
  };
}

/**
 * Delete feature flag
 */
export async function deleteFlag(key: string): Promise<void> {
  await prisma.featureFlag.delete({
    where: { key },
  });
  
  flagCache.delete(key);
  
  logger.info({ key }, 'Feature flag deleted');
}

/**
 * Clear cache
 */
export function clearCache(): void {
  flagCache.clear();
}

/**
 * Common feature flag keys
 */
export const FLAGS = {
  TWO_FACTOR_AUTH: '2fa_enabled',
  GOOGLE_OAUTH: 'google_oauth',
  GITHUB_OAUTH: 'github_oauth',
  PDF_REPORTS: 'pdf_reports',
  COST_TRACKING: 'cost_tracking',
  AUTO_AUDIT: 'auto_audit',
} as const;
