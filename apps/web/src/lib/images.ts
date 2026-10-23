/**
 * Can next/image optimise this URL? Only local paths and the hosts allowed by
 * images.remotePatterns in next.config.ts. Anything else (an admin-entered or
 * seeded URL on another host) must be rendered with `unoptimized`, otherwise
 * next/image throws and the whole page fails with a 500.
 */
export function isOptimizable(src: string): boolean {
  if (src.startsWith('/') && !src.startsWith('//')) return true;
  try {
    const { protocol, hostname, pathname } = new URL(src);
    if (protocol !== 'https:') return false;
    return (
      (hostname.endsWith('.supabase.co') && pathname.startsWith('/storage/v1/object/public/')) ||
      hostname === 'images.unsplash.com' ||
      hostname === 'picsum.photos'
    );
  } catch {
    return false;
  }
}
