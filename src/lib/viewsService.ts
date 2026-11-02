import axios from 'axios';

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Record a page view (atomic increment in Redis + sync to DB)
 * Uses sessionStorage guard so refreshing within the same session does not artificially inflate counts
 */
export async function recordPageView(
  entityType: 'tool' | 'blog',
  slug: string
): Promise<number | null> {
  if (typeof window === 'undefined' || !slug) return null;

  const storageKey = `pv_recorded_${entityType}_${slug}`;
  const alreadyViewed = sessionStorage.getItem(storageKey);

  try {
    const apiUrl = getApiUrl();

    // If already viewed in this browser session, just fetch the latest count without incrementing
    if (alreadyViewed) {
      const res = await axios.get(`${apiUrl}/views/${entityType}/${slug}`);
      return res.data?.views ?? null;
    }

    // Otherwise, increment atomically
    const res = await axios.post(`${apiUrl}/views/${entityType}/${slug}`);
    sessionStorage.setItem(storageKey, '1');
    return res.data?.views ?? null;
  } catch (err) {
    console.warn(`[Views] Failed to record view for ${entityType}/${slug}:`, err);
    return null;
  }
}

/**
 * Fetch view count for a specific page without incrementing
 */
export async function getPageViewCount(
  entityType: 'tool' | 'blog',
  slug: string
): Promise<number> {
  try {
    const apiUrl = getApiUrl();
    const res = await axios.get(`${apiUrl}/views/${entityType}/${slug}`);
    return res.data?.views ?? 0;
  } catch (err) {
    return 0;
  }
}

/**
 * Batch fetch views for an entity type (e.g. all tools)
 */
export async function getBatchViews(
  entityType: 'tool' | 'blog'
): Promise<Record<string, number>> {
  try {
    const apiUrl = getApiUrl();
    const res = await axios.get(`${apiUrl}/views/${entityType}`);
    return res.data?.views ?? {};
  } catch (err) {
    return {};
  }
}

/**
 * Format numbers for display (e.g., 1450 -> "1.5K", 23 -> "23")
 */
export function formatViews(count: number): string {
  if (!count || count <= 0) return '0';
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1_000) {
    return (count / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toLocaleString();
}
