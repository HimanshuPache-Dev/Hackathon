import { Router } from 'express';
import { supabase, assertDatabase } from '../config/supabase';
import { requireCommander } from '../middleware/auth.middleware';
const router = Router();
router.get('/', async (_req, res, next) => { try { const data = assertDatabase(await supabase.from('recommendations').select('*,junctions(name,current_risk_score),officers(name,badge_code)').eq('status', 'PENDING').order('deployment_priority', { ascending: false })); res.json({ success: true, data }); } catch (error) { next(error); } });
router.use(requireCommander);
async function decide(id: string, decision: string, notes?: string) {
  const recommendation: any = assertDatabase(await supabase.from('recommendations').update({ status: decision, commander_decision_at: new Date().toISOString(), commander_notes: notes }).eq('id', id).select().single());
  assertDatabase(await supabase.from('decision_logs').insert({ recommendation_id: id, decision, decision_notes: notes }));
  if (decision === 'ACCEPTED') assertDatabase(await supabase.from('officers').update({ status: 'EN_ROUTE', available: false, current_junction_id: recommendation.junction_id }).eq('id', recommendation.officer_id));
  return recommendation;
}
router.post('/:id/accept', async (req, res, next) => { try { res.json({ success: true, data: await decide(req.params.id, 'ACCEPTED', req.body.notes) }); } catch (error) { next(error); } });
router.post('/:id/reject', async (req, res, next) => { try { res.json({ success: true, data: await decide(req.params.id, 'REJECTED', req.body.reason) }); } catch (error) { next(error); } });
router.post('/:id/modify', async (req, res, next) => { try { const data = assertDatabase(await supabase.from('recommendations').update({ status: 'MODIFIED', officer_id: req.body.new_officer_id ?? req.body.newOfficerId, junction_id: req.body.new_junction_id ?? req.body.newJunctionId, commander_decision_at: new Date().toISOString() }).eq('id', req.params.id).select().single()); assertDatabase(await supabase.from('decision_logs').insert({ recommendation_id: req.params.id, decision: 'MODIFIED', decision_notes: req.body.notes })); res.json({ success: true, data }); } catch (error) { next(error); } });
export default router;
