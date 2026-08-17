import { Router } from 'express';
import { supabase, assertDatabase } from '../config/supabase';
import { calculateRiskScore } from '../risk/calculator';
import { createRecommendation } from '../services/recommendation-engine';
import { requireCommander } from '../middleware/commander-auth';
const router = Router();

async function recalculate(junctionId: string, incident: number) {
  const junction: any = assertDatabase(await supabase.from('junctions').select('*').eq('id', junctionId).single());
  const result = calculateRiskScore({ accidentHistory: junction.historical_risk_score / 100, congestion: junction.current_congestion ?? 0, violations: junction.current_violations ?? 0, obstructions: junction.current_obstruction ?? 0, weather: junction.current_weather ?? 0, events: junction.current_event ?? 0, incidents: incident });
  return assertDatabase(await supabase.from('junctions').update({ current_incident: incident, current_risk_score: Math.round(result.score), current_risk_level: result.level }).eq('id', junctionId).select().single());
}

router.post('/simulate', requireCommander, async (req, res, next) => {
  try {
    const { junction_id, junctionId, severity = 0.8, incident_type = 'COLLISION' } = req.body;
    const id = junction_id ?? junctionId;
    const junction: any = assertDatabase(await supabase.from('junctions').select('*').or(`id.eq.${id},junction_id.eq.${id}`).single());
    const numericSeverity = typeof severity === 'number' ? severity : ({ MINOR: .25, MAJOR: .5, SEVERE: .7, CRITICAL: .8 } as any)[severity] ?? .8;
    const incident = assertDatabase(await supabase.from('incidents').insert({ junction_id: junction.id, junction_name: junction.name, severity: numericSeverity, incident_type, is_simulated: true }).select().single());
    const updated: any = await recalculate(junction.id, numericSeverity);
    const recommendation = updated.is_unmanned && ['HIGH', 'CRITICAL'].includes(updated.current_risk_level) ? await createRecommendation(updated) : null;
    res.status(201).json({ success: true, data: { incident, junction: updated, recommendation } });
  } catch (error) { next(error); }
});
router.post('/:id/resolve', async (req, res, next) => { try { const incident: any = assertDatabase(await supabase.from('incidents').update({ status: 'RESOLVED', resolved_at: new Date().toISOString() }).eq('id', req.params.id).select().single()); await recalculate(incident.junction_id, 0); res.json({ success: true, data: incident }); } catch (error) { next(error); } });
router.get('/active', async (_req, res, next) => { try { const data = assertDatabase(await supabase.from('incidents').select('*').eq('status', 'ACTIVE').order('reported_at', { ascending: false })); res.json({ success: true, data }); } catch (error) { next(error); } });
export default router;
