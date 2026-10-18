import { timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';

// Called by the API after admins change storefront content (e.g. the
// homepage hero) so it shows up now instead of after the ISR window.
// Configure the same REVALIDATE_SECRET here and in apps/api.
const ALLOWED_TAGS = new Set(['homepage']);

function secretMatches(given: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!secretMatches(request.headers.get('x-revalidate-secret'))) {
    return Response.json({ revalidated: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { tag?: unknown };
  const tag = typeof body.tag === 'string' ? body.tag : '';
  if (!ALLOWED_TAGS.has(tag)) {
    return Response.json({ revalidated: false, message: 'Unknown tag' }, { status: 400 });
  }

  // expire: 0 → the next visitor gets fresh content, not one more stale render
  revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: true, now: Date.now() });
}
