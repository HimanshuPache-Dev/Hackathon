import { supabase, assertDatabase } from '../config/supabase';
import { rankAvailableOfficers } from './allocation-engine';

export async function createRecommendation(junction: any) {
  const officers = assertDatabase(await supabase.from('officers').select('*').eq('available', true));
  const officer = rankAvailableOfficers(junction, officers)[0];
  if (!officer) return null;
  const coverageGap = Math.max(1, junction.coverage_gap ?? 1);
  const priority = Math.round(0.85 * junction.current_risk_score + 15 * coverageGap);
  const reasons = [
    `${junction.current_risk_level} current risk (${junction.current_risk_score}/100)`,
    'No active officer coverage',
    `Nearest available officer (${officer.distance_km.toFixed(1)} km)`,
  ];
  const payload = {
    junction_id: junction.id,
    officer_id: officer.id,
    recommendation_text: `Deploy badge ${officer.badge_code} to ${junction.name}`,
    travel_time_minutes: officer.travel_time_minutes,
    expected_risk_reduction: Math.min(35, 15 + coverageGap * 10),
    deployment_priority: priority,
    reasons,
    confidence: junction.confidence,
  };
  return assertDatabase(await supabase.from('recommendations').insert(payload).select('*, junctions(name), officers(name,badge_code)').single());
}
