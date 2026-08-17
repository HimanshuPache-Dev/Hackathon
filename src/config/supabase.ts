import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicKey = process.env.SUPABASE_ANON_KEY;

if (!url || !serviceKey || !publicKey) {
  throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are required');
}

export const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Authentication must use a separate client. Signing in on the service client
// would replace its service-role Authorization header with the user's JWT.
export const supabaseAuth = createClient(url, publicKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export function assertDatabase<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null) throw new Error('Database operation returned no data');
  return result.data;
}
