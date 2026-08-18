import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const localTypeScriptRuntime = [...process.argv, ...process.execArgv].some((value) => value.includes('ts-node'));
dotenv.config({ override: process.env.NODE_ENV !== 'production' || localTypeScriptRuntime });

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

type CommanderUser = { id: string; app_metadata?: { role?: string } };
type CommanderSession = { access_token: string; expires_at?: number };

export async function signInCommander(email: string, password: string): Promise<{
  user: CommanderUser;
  session: CommanderSession;
} | null> {
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: publicKey!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (response.status === 400 || response.status === 401) return null;
  if (!response.ok) throw new Error(`Supabase authentication unavailable (${response.status})`);
  const payload = await response.json() as { user: CommanderUser; access_token: string; expires_at?: number };
  return { user: payload.user, session: { access_token: payload.access_token, expires_at: payload.expires_at } };
}

export async function getCommanderUser(token: string): Promise<CommanderUser | null> {
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: publicKey!, Authorization: `Bearer ${token}` },
  });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error(`Supabase authentication unavailable (${response.status})`);
  return response.json() as Promise<CommanderUser>;
}

export function assertDatabase<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null) throw new Error('Database operation returned no data');
  return result.data;
}
