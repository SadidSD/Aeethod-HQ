import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aeqyexvchhsbquskuydq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_BCIpOc-GajLDMOf0qHT7dQ_3RRsfhLh';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 20,
    },
  },
});

/**
 * Health check helper to verify Supabase connectivity
 */
export async function checkSupabaseHealth(): Promise<{ online: boolean; latencyMs: number; error?: string }> {
  const start = performance.now();
  try {
    const { error } = await supabase.from('agencies').select('id').limit(1);
    const latencyMs = Math.round(performance.now() - start);
    if (error) {
      return { online: false, latencyMs, error: error.message };
    }
    return { online: true, latencyMs };
  } catch (err: any) {
    return { online: false, latencyMs: Math.round(performance.now() - start), error: err?.message || 'Connection failed' };
  }
}
