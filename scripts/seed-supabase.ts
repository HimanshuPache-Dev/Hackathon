import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { junctionDatasetProvenance, junctionDatasetSummary, junctions } from '../data/junctions';
import { officers } from '../data/officers';
import { scenarioInputs } from '../data/scenarios';
import { calculateRiskScore } from '../src/risk/calculator';
import bcrypt from 'bcryptjs';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding');
const officerPin = process.env.DEMO_OFFICER_PIN;
if (!officerPin) throw new Error('Set DEMO_OFFICER_PIN before seeding officers');
const supabase = createClient(url, key);

async function seed() {
  const junctionRows = junctions.map((item) => {
    const scenario = scenarioInputs[item.id];
    const risk = calculateRiskScore({ accidentHistory:item.historicalScore/100, congestion:scenario?.congestion??0, violations:scenario?.violations??0, obstructions:scenario?.obstruction??0, weather:scenario?.weather??0, events:scenario?.event??0, incidents:scenario?.currentIncident??0 });
    return ({
    junction_id: item.id, name: item.locationName, latitude: item.latitude, longitude: item.longitude,
    historical_crashes: item.historicalCrashes, fatalities: item.fatalities, major_injuries: item.majorInjuries,
    minor_injuries: item.minorInjuries, weighted_severity_index: item.weightedSeverity,
    historical_risk_score: item.historicalScore, historical_tier: item.riskTier,
    current_congestion:scenario?.congestion??0, current_violations:scenario?.violations??0, current_obstruction:scenario?.obstruction??0,
    current_weather:scenario?.weather??0, current_event:scenario?.event??0, current_incident:scenario?.currentIncident??0,
    current_risk_score:Math.round(risk.score), current_risk_level:risk.level,
    confidence: item.confidenceLevel === 'PASS' ? 'MEDIUM-HIGH' : item.confidenceLevel, evidence_url: item.sourceUrl,
  }); });
  const junctionResult = await supabase.from('junctions').upsert(junctionRows, { onConflict: 'junction_id', ignoreDuplicates: true });
  if (junctionResult.error) throw junctionResult.error;
  for (const row of junctionRows) {
    const { junction_id, historical_crashes, fatalities, major_injuries, minor_injuries, weighted_severity_index, historical_risk_score, historical_tier, ...operational } = row;
    const updateResult = await supabase.from('junctions').update(operational).eq('junction_id', junction_id);
    if (updateResult.error) throw updateResult.error;
  }
  const seededJunctions:any[]=await (async()=>{const{data,error}=await supabase.from('junctions').select('id,junction_id,name,latitude,longitude');if(error)throw error;return data??[]})();
  const junctionByCode=new Map(seededJunctions.map(item=>[item.junction_id,item]));
  const officerRows = await Promise.all(officers.map(async (item: any, index: number) => {
    const station = junctionByCode.get(item.currentJunctionId);
    return ({
    name: item.name ?? `Traffic Officer ${index + 1}`, badge_code: item.badgeCode ?? item.badge_code ?? `NP-${String(index + 1).padStart(3, '0')}`,
    pin_hash: await bcrypt.hash(officerPin, 12), status: item.status ?? 'OFF_DUTY', available: item.status === 'AVAILABLE',
    current_junction_id:station?.id??null,current_junction_name:station?.name??null,
    latitude: item.latitude ?? station?.latitude, longitude: item.longitude ?? station?.longitude,
  }); }));
  for(const row of officerRows){
    const{data:existing,error:lookupError}=await supabase.from('officers').select('id').eq('badge_code',row.badge_code).maybeSingle();
    if(lookupError)throw lookupError;
    if(existing){const{pin_hash,...operational}=row;const{error}=await supabase.from('officers').update(operational).eq('id',existing.id);if(error)throw error}
    else{const{error}=await supabase.from('officers').insert(row);if(error)throw error}
  }
  console.log(`Seeded ${junctionRows.length} evidence-backed junctions and ${officerRows.length} officers.`);
  console.log(`Dataset verified from ${junctionDatasetProvenance.workbook}/${junctionDatasetProvenance.worksheet}: ${junctionDatasetSummary.historicalCrashes} crashes, ${junctionDatasetSummary.fatalities} fatalities, ${junctionDatasetSummary.weightedSeverity} weighted severity.`);
}
seed().catch((error) => { console.error(error); process.exit(1); });
