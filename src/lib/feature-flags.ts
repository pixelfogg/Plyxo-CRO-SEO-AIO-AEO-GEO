import { db } from '@/db';
import { featureFlags } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Fallback configurations for when DB is unavailable or initial load
const DEFAULT_FLAGS = {
  isCloudEdition: false, // Default to Community Edition
  enableTeams: false,
  enableApiAccess: false,
  enableWhiteLabel: false,
  enableScheduledScans: false,
  enableCompetitorAnalysis: false,
};

export type FeatureFlagKey = keyof typeof DEFAULT_FLAGS;

export async function getFeatureFlag(key: FeatureFlagKey): Promise<boolean> {
  if (key === 'isCloudEdition' && process.env.NEXT_PUBLIC_IS_CLOUD_EDITION !== undefined) {
    return process.env.NEXT_PUBLIC_IS_CLOUD_EDITION === 'true';
  }

  try {
    const flag = await db.query.featureFlags.findFirst({
      where: eq(featureFlags.name, key),
    });
    
    if (flag) {
      return flag.isEnabled ?? false;
    }
    
    return DEFAULT_FLAGS[key];
  } catch (error) {
    console.error(`Error fetching feature flag ${key}:`, error);
    return DEFAULT_FLAGS[key];
  }
}

export async function getAllFeatureFlags() {
  try {
    const flags = await db.query.featureFlags.findMany();
    const flagsMap = { ...DEFAULT_FLAGS };
    
    flags.forEach((flag) => {
      if (flag.name in flagsMap) {
        // @ts-ignore
        flagsMap[flag.name as FeatureFlagKey] = flag.isEnabled ?? false;
      }
    });
    
    if (process.env.NEXT_PUBLIC_IS_CLOUD_EDITION !== undefined) {
      flagsMap.isCloudEdition = process.env.NEXT_PUBLIC_IS_CLOUD_EDITION === 'true';
    }
    
    return flagsMap;
  } catch (error) {
    console.error('Error fetching all feature flags:', error);
    return DEFAULT_FLAGS;
  }
}
