import { createClient, RealtimeChannel } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL; const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const client = url && key ? createClient(url,key) : null;
export function subscribeToOperations(onChange:()=>void):()=>void {
  if (!client) return () => undefined;
  const accessToken = localStorage.getItem('safeflow_token');
  if (accessToken) client.realtime.setAuth(accessToken);
  const channel: RealtimeChannel = client.channel('safeflow-dashboard');
  ['junctions','officers','incidents','recommendations','realtime_locations'].forEach((table) => channel.on('postgres_changes',{event:'*',schema:'public',table},onChange));
  channel.subscribe(); return () => { client.removeChannel(channel); };
}
