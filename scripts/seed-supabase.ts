import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { junctions } from '../data/junctions';
import { officers } from '../data/officers';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding');
const supabase = createClient(url, key);

async function seed() {
  const junctionRows = junctions.map((item) => ({
    junction_id: item.id, name: item.locationName, latitude: item.latitude, longitude: item.longitude,
    historical_crashes: item.historicalCrashes, fatalities: item.fatalities, major_injuries: item.majorInjuries,
    minor_injuries: item.minorInjuries, weighted_severity_index: item.weightedSeverity,
    historical_risk_score: item.historicalScore, historical_tier: item.riskTier,
    current_risk_score: item.historicalScore, current_risk_level: item.riskTier === 'ELEVATED' ? 'MEDIUM' : item.riskTier,
    confidence: item.confidenceLevel === 'PASS' ? 'MEDIUM-HIGH' : item.confidenceLevel, evidence_url: item.sourceUrl,
  }));
  const junctionResult = await supabase.from('junctions').upsert(junctionRows, { onConflict: 'junction_id', ignoreDuplicates: true });
  if (junctionResult.error) throw junctionResult.error;
  const officerRows = officers.map((item: any, index: number) => {
    const station = junctions.find((junction) => junction.id === item.currentJunctionId);
    return ({
    name: item.name ?? `Traffic Officer ${index + 1}`, badge_code: item.badgeCode ?? item.badge_code ?? `NP-${String(index + 1).padStart(3, '0')}`,
    pin_hash: item.pin ?? '1234', status: item.status ?? 'OFF_DUTY', available: item.status === 'AVAILABLE',
    latitude: item.latitude ?? station?.latitude, longitude: item.longitude ?? station?.longitude,
  }); });
  const officerResult = await supabase.from('officers').upsert(officerRows, { onConflict: 'badge_code', ignoreDuplicates: true });
  if (officerResult.error) throw officerResult.error;
  console.log(`Seeded ${junctionRows.length} evidence-backed junctions and ${officerRows.length} officers.`);
}
seed().catch((error) => { console.error(error); process.exit(1); });
