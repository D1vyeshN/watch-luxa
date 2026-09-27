import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';
import { logger } from './logger';

let supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env'
      );
    }

    supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    logger.info('✅ Supabase client initialized');
  }

  return supabase;
};

export const SUPABASE_BUCKET = 'luxe-timepieces';
