import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');

async function run() {
  const supabase = createClient(url!, key!, { auth: { persistSession: false } });
  const { data, error } = await supabase.from('officers').select('id,pin_hash');
  if (error) throw error;
  let updated = 0;
  for (const officer of data ?? []) {
    if (!officer.pin_hash || /^\$2[aby]\$/.test(officer.pin_hash)) continue;
    const pinHash = await bcrypt.hash(officer.pin_hash, 12);
    const result = await supabase.from('officers').update({ pin_hash: pinHash }).eq('id', officer.id);
    if (result.error) throw result.error;
    updated += 1;
  }
  console.log(`Hashed ${updated} legacy officer PIN record(s).`);
}

run().catch((error) => { console.error(error instanceof Error ? error.message : 'PIN migration failed'); process.exit(1); });
