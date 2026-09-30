import { env } from '@/config/env';

interface FetchOptions {
  revalidate?: number;
  tags?: string[];
}

export async function serverFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T | null> {
  const { revalidate = 300, tags = [] } = options;

  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
      next: { revalidate, tags },
    });

    if (!res.ok) {
      console.error(`[serverFetch] ${path} → ${res.status}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error(`[serverFetch] ${path} failed:`, error);
    return null;
  }
}
