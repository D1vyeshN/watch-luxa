'use client';

import { useEffect } from 'react';
import { getOrCreateSessionId } from '@/lib/storage/sessionStorage';

export function SessionInit() {
  useEffect(() => {
    // Ensure session ID exists on mount
    getOrCreateSessionId();
  }, []);

  return null;
}
