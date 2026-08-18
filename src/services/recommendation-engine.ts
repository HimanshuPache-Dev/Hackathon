import { supabase, assertDatabase } from '../config/supabase';
import { normalizedCoverageGap,rankAvailableOfficers } from './allocation-engine';

export async function createRecommendation(junction: any,incidentId?:string) {
  if(incidentId){const{data:existing,error}=await supabase.from('recommendations').select('*,junctions(name),officers(name,badge_code)').eq('incident_id',incidentId).eq('status','PENDING').maybeSingle();if(error)throw error;if(existing)return existing}
  const officers = assertDatabase(await supabase.from('officers').select('*').eq('available', true));
  const officer = rankAvailableOfficers(junction, officers)[0];
  if (!officer) return null;
  const coverageGap = normalizedCoverageGap(junction.required_officers??1,junction.assigned_officers??0);
  const priority = Math.round(0.85 * junction.current_risk_score + 15 * coverageGap);
  const reasons = [
    `${junction.current_risk_level} current risk (${junction.current_risk_score}/100)`,
    'No active officer coverage',
    `Nearest available officer (${officer.distance_km.toFixed(1)} km)`,
  ];
  const payload = {
    junction_id: junction.id,
    incident_id:incidentId,
    officer_id: officer.id,
    recommendation_text: `Deploy badge ${officer.badge_code} to ${junction.name}`,
    travel_time_minutes: officer.travel_time_minutes,
    expected_risk_reduction: Math.round(coverageGap*100),
    deployment_priority: priority,
    reasons,
    confidence: junction.confidence,
  };
  return assertDatabase(await supabase.from('recommendations').insert(payload).select('*, junctions(name), officers(name,badge_code)').single());
}
